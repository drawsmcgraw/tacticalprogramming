Title: Self-Signed Certs with Subject Alt Names
Date: 2023-05-11
Category: howto

# Problem

We need to create self-signed certs. But because browsers/tools are finally [enforcing](https://www.chromestatus.com/feature/4981025180483584) what they [said they would for years](https://tools.ietf.org/html/rfc2818), we have to put the CN into the list of SANs for the cert. This is non-negotiable.

That means we have to use the x509v3 extensions. Which is highly forgettable.

# Solution

Automate as much as is reasonable. Worth noting that this worked as of this writing for securing an NPM registry proxy. Your solution/tech stack may need more/different options in the config. Read the errors you hit and act accordingly.

At a high level:
* Create a config file
* Create a key
* Create a CSR, referencing the config file
* Sign the CSR, referencing the config file

In detail.

Here's our config file, named 'openssl.cnf'.

```txt
[req]
prompt = no
req_extensions = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]
countryName = US
stateOrProvinceName = DE
localityName = Syndicated Inc
organizationName = Mailroom
commonName = npm.tacticalprogramming.com

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = npm.tacticalprogramming.com
IP.2 = 12.34.56.78
```

What you need to customize, are:
* Everything under `[req_distinguished_name]`
* Everything under `[alt_names]`

Also note that, when putting a DNS name into the SANs, use `DNS.1=`. When putting an IP, use `IP.1` (and be sure to increment the counter as needed).

Here's your copy/pasta.

```sh
# create-self-signed-cert.sh

# Create the key
openssl genrsa -out server.key 2048

# Using the key, create the CSR
openssl req -new -key server.key -out server.csr -config openssl.cnf

# Sign the CSR using the key we just made
openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365 -extensions v3_req -extfile openssl.cnf
```

And to test, use this command:

```
openssl x509 -text -in server.crt
```

And look for this field:

```
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:npm.tacticalprogramming.com, IP Address:12.34.56.78
```

That's evidence that your cert has the correct entries for SANs.

You're welcome. Now get back to work.
