Title: Another Certificate Request Post with SAN Action
Date: 2018-10-17
Category: howto

# Problem
We need to make several Certificate Signing Requests (CSRs) for our datacenter. Two, or two-thousand, it doesn't matter. We're putting together a one-liner that will solve it for us. Of course we're automating it.

# Solution
Create a text file containing your server short names. Say, `servers.txt`.

```
salt-master-01
es-data-01
es-data-02
es-data-03
es-data-04
es-data-05
es-data-06
es-kibana-01
streamsets-sdc-01
streamsets-sdc-02
```

Set your domain via an environment variable:
```sh
DOMAIN=lab.company.com
```

And fire away:
```sh
for SERVER in `cat servers.txt`; do openssl req -new -newkey rsa:2048 -keyout ${SERVER}.${DOMAIN}.key -nodes -out ${SERVER}.${DOMAIN}.csr -subj "/C=Country/ST=State/L=City/O=Company/OU=Team Awesome/CN=${SERVER}.${DOMAIN}" -reqexts SAN -extensions SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:${SERVER}.${DOMAIN},DNS:${SERVER}\n[v3_req]\nextendedKeyUsage=serverAuth,clientAuth\n")); done
```

Put more human-friendly:
```sh
for SERVER in `cat servers.txt`; do\
    openssl req -new \
    -newkey rsa:2048 \
    -keyout ${SERVER}.${DOMAIN}.key \
    -nodes \
    -out ${SERVER}.${DOMAIN}.csr \
    -subj "/C=Country/ST=State/L=City/O=Company/OU=Team Awesome/CN=${SERVER}.${DOMAIN}" \
    -reqexts SAN \
    -extensions SAN \
    -reqexts v3_req \
    -extensions v3_req \
    -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\n\
                                                 subjectAltName=DNS:${SERVER}.${DOMAIN},DNS:${SERVER}\n\
                                                 [v3_req]\n\
                                                 extendedKeyUsage=serverAuth,clientAuth\n")); \
done
```

Note - the path `/etc/ssl/openssl.cnf` is for Debian/Ubuntu distros. For RHEL/CentOS and the like, you'll want to use `/etc/pki/tls/openssl.cnf` instead.

And there you go! A directory full of CSRs, along with shiny new private keys to go along with them.

Since openssl reads its config from a text file, we fake it out by inline printing the relevant portion of the config, changing the portion that we need (in this case, the `SAN` and `v3_req` sections).

Note, also, that this incant lets us specify Subject Alternative Names (SANs). This is important because, apparently, as of version 58, Chrome [requires that you put the subject into the SAN field of your cert](https://productforums.google.com/forum/#!topic/chrome/-19ZxwjaCjw).

Lastly, remember that, when you add a new section to your in-line config (i.e. `v3_req` for `extendedKeyUsage`), you need to also ask openssl to use that section (in this case, with the `-reqexts v3_req` and `-extensions v3_req` flags).

That is all. Now get back to work!
