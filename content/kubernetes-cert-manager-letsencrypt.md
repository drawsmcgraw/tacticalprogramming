Title: Using cert-manager in Kubernetes with Lets Encrypt
Date: 2022-01-19
Category: howto


# Problem

We have Kubernetes. We need a cert. We want to use Let's Encrypt to create (and manage) that cert for us.


# Solution

We can install [cert-manager](https://cert-manager.io/docs/installation/) and, with three objects, do exactly that. At a high level, we create a [ClusterIssuer](https://cert-manager.io/docs/configuration/acme/), we configure it with our cloud credentials (in this case AWS), and we request a certificate.

We'll be using Harbor as the example application but this can be used for any service requiring a cert.

NOTE: There are several ways to accomplish this task. This post is but one way of doing it. You're mileage may vary, void where prohibited.


## Create a ClusterIssuer

Going from [the docs](https://cert-manager.io/docs/configuration/acme/), we can create a ClusterIssuer like so:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
spec:
  acme:

    # Start with the 'staging' server for testing. When you have it
    # working, then use the 'prod' server.

    # Prod
    #server: https://acme-v02.api.letsencrypt.org/directory

    # Staging
    server: https://acme-staging-v02.api.letsencrypt.org/directory

    # A private key is created as part of the registration with ACME. You
    # don't need to create this, you just tell the Issuer what secret to 
    # store it in.
    privateKeySecretRef:
      name: letsencrypt

    # We're going to go with the DNS challenge.
    solvers:
    - selector:
        dnsZones:
          - "tacticalprogramming.com"
      dns01:
        route53:
          region: us-east-2
          accessKeyID: REDACTED

          # k8s secret that holds our AWS secret access key.
          secretAccessKeySecretRef:
            name: prod-route53-credentials-secret
            key: secret-access-key
```

That block creates the ClusterIssuer and configures it to where it can answer the DNS challenge for Let's Encrypt. Now let's make a k8s secret to hold our AWS secret access key:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: prod-route53-credentials-secret
type: Opaque
stringData:
  secret-access-key: REDACTED
```

NOTE: The access/secret key you give to cert-manager has to at least have the rights to change Route53 entries, else the challenges will fail.

## Request a Certificate

One more stanza:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: harbor.tacticalprogramming.com
spec:

  # The cert will be stored in a k8s secret. You choose the name of that secret.
  secretName: tls-harbor-acme

  issuerRef:
    kind: ClusterIssuer
    name: letsencrypt

  # CN for our cert
  commonName: harbor.tacticalprogramming.com

  # SAN, or Subject Alternative Names, to put in.
  # ALWAYS include the CN as a SAN as well.
  # see https://chromestatus.com/feature/4981025180483584
  # and https://datatracker.ietf.org/doc/html/rfc2818 (search for 'common name')
  dnsNames:
  - "harbor.tacticalprogramming.com"
  - "*.harbor.tacticalprogramming.com"
```

## Deploy and Fetch the Cert

That's all. Now let's look at the whole thing as one.

```yaml
#
# tls-harbor-acme.yaml
#

apiVersion: v1
kind: Secret
metadata:
  name: prod-route53-credentials-secret
type: Opaque
stringData:
  secret-access-key: REDACTED
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
spec:
  acme:

    # Prod
    server: https://acme-v02.api.letsencrypt.org/directory

    # Staging
    #server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt
    solvers:
    - selector:
        dnsZones:
          - "tacticalprogramming.com"
      dns01:
        route53:
          region: us-east-2
          accessKeyID: REDACTED
          secretAccessKeySecretRef:
            name: prod-route53-credentials-secret
            key: secret-access-key
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: harbor.tacticalprogramming.com
spec:
  secretName: tls-harbor-acme
  issuerRef:
    kind: ClusterIssuer
    name: letsencrypt
  commonName: harbor.tacticalprogramming.com
  dnsNames:
  - "harbor.tacticalprogramming.com"
  - "*.harbor.tacticalprogramming.com"
```

When applying these objects, deploy them into the `cert-manager` namespace (or wherever you deployed cert-manager). If you don't do this, cert-manager can't find the k8s secret and fails to update Route53, throwing an error like `"error"="error getting route53 secret access key: secret \"prod-route53-credentials-secret\" not found"`.

```
kubectl -n cert-manager apply -f cert-manager-harbor.yaml
```

Tail the cert-manager logs (usually a `cert-manager` pod in the cert-manager namespace) to check for any errors along the way. If all goes well, you should have a k8s secret in the `cert-manager` namespace called `tls-harbor-acme` (if you used the yaml from above). 

Be patient. Remember, ACME is issuing a challenge, Route53 entries are being made, DNS is being propogated. It may take a few moments for your cert to be generated and you will see lines in the cert-manager logs that may _look_ like errors but are just noisey reconciliation loops.


Let's fetch our new cert!

```
kubectl -n cert-manager get secret/tls-harbor-acme -o yaml`

apiVersion: v1
data:
  tls.crt: ArglBARgledata.....
  tls.key: DifferentArglBARgledata.....
  .
  .
  .
```

The `tls.cert` and `tls.key` contain, well, the cert and key. As of this writing, the CA cert is embedded in the client cert. Also as of this writing, the _first_ cert in that file is your client cert (i.e. the one I use for Harbor). All the subsequent certs are the CA chain. Keep that in mind if you need to separate the client cert from the CA cert (I know I need to for Harbor).

Base64 decode those values to get your cert:

```
echo 'ArglBARgledata....' | base64 -d > harbor.crt
```

And run a sanity check to be sure you have the right cert:

```
openssl x509 -text -in harbor.crt

Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            04:de:ad:be:ef:2c:75:c2:de:ad:be:ef:0c:de:ad:be:ef:cc
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = US, O = Let's Encrypt, CN = R3
        Validity
            Not Before: Jan 19 17:44:37 2022 GMT
            Not After : Apr 19 17:44:36 2022 GMT
        Subject: CN = harbor.tacticalprogramming.com
```

You now have cert-manager automatically requesting certs for you. Getting those certs automatically handed off, or even plugged into an ingress controller for full automation, would be an admirable next step. For now, though, enjoy your automated cert management and get back to doing the more interesting work.

