Title: Managing Your own CA and Issuing a Wildcard Cert
Date: 2019-06-06
Category: howto

# Disclaimer
It was recently brought to my attention that this problem is probably solved by using `certstrap`, courtesty of Square. If you're in a hurry, I'd encourage you to go and give that a try first.

Link: [https://github.com/square/certstrap](https://github.com/square/certstrap)

I'm leaving the below for posterity and pedagogical use.

# Problem
Wildcard certs are expensive, especially for home labs. It seems, though, that the Internet is full of how-to's and "works for me!" type solutions. That browser behavior has changed since a lot of those solutions were published only exacerbates the issue.

This is another one of those write-ups.

# Solution
We should create our own Cert Authority. Then use that CA to create as many internal certs as we need, including a wildcard cert. After all, plenty of organizations run their own internal CA, so we should get familiar with that life cycle. This solution will focus on creating a wildcard cert with multiple subdomains, like you would find in a typical Cloud Foundry deployment.

## Create the CA

```sh
# Create the CA's key
openssl genrsa -des3 -out homelab.net.ca.key

# Create the CA's cert
openssl req -x509 -new -nodes -key homelab.net.ca.key -sha256 -days 1825 -out homelab.net.ca.pem
```

Answer the questions as needed.

## Create a Config for Our Wildcard CSR
I hate creating temporary files but we don't do this very often (yet) so we're going to be lazy this time.

Create your config file, specifying the wildcard domain. Apparently, we no longer use the CN in a certificate to identify servers and, instead, should be using the SAN field. For some light reading on the topic, see [this Chrome platform status post](https://www.chromestatus.com/feature/4981025180483584) and [rfc2818](https://tools.ietf.org/html/rfc2818) (run a text search for 'common name').

As such, be sure to make use of the SAN field, and get them right.

Our config file for generating our wildcard CSR
```
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no
[req_distinguished_name]
C  =  US
ST  =  CA
L  =  Beverly Hills
O  =  Homelab
OU  =  Homelab 
CN  =  *.homelab.net
[v3_req]
extendedKeyUsage = serverAuth,clientAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = *.homelab.net
DNS.2 = *.lab.homelab.net
DNS.3 = *.pcf.lab.homelab.net
DNS.4 = *.apps.pcf.lab.homelab.net
DNS.5 = *.sys.pcf.lab.homelab.net
DNS.6 = *.login.sys.pcf.lab.homelab.net
DNS.7 = *.uaa.sys.pcf.lab.homelab.net
```

Yes, that's a lot of subdomains. What can I say? We do a lot of work.

## Create our CSR

Assuming we named our config file `csr-config.conf`.
```sh
openssl req -new \
-newkey rsa:2048 \
-key wildcard.homelab.net.key \
-nodes \
-out wildcard.homelab.net.csr \
-extensions v3_req \
-config csr-config.conf
```

## Create the Config File to Sign the CSR

Apparently also required, as the SANs never made it into the signed cert if I excluded the config file.

```ini
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
[req_ext]
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.homelab.net
DNS.2 = *.lab.homelab.net
DNS.3 = *.pcf.lab.homelab.net
DNS.4 = *.apps.pcf.lab.homelab.net
DNS.5 = *.sys.pcf.lab.homelab.net
DNS.6 = *.login.sys.pcf.lab.homelab.net
DNS.7 = *.uaa.sys.pcf.lab.homelab.net
```

## Sign the CSR With Our CA's Cert

In this case, the config file we just created is named `signing-config.conf`.
```sh
openssl x509 -req \
-in wildcard.homelab.net.csr \
-CA homelab.net.ca.pem \
-CAkey homelab.net.ca.key \
-CAcreateserial \
-out wildcard.homelab.net.crt \
-days 1825 \
-sha256 \
-extfile signing-config.conf \
-extensions req_ext
```

## Confirm

Confirm the SAN field has the correct domains, subdomains, and wildcard entries needed.
```sh
openssl x509 -text -in wildcard.homelab.net.crt
```

# Share and Enjoy

Just import the CA `.pem` that you created into your browser and you now have your own little CA and your own seamless browser experience. Enjoy!

# Credits
The Internet is full of articles on the subject. These were particularly useful to me.

* [How to setup your own CA with OpenSSL](https://gist.github.com/Soarez/9688998)
* [OpenSSL x509v3 Docs](https://www.openssl.org/docs/manmaster/man5/x509v3_config.html)
* [Citrix Article on CSR with Multiple SANs](https://support.citrix.com/article/CTX227983)
