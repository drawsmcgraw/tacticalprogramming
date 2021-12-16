Title: Rotating Pinniped Credentials in Tanzu Kubernetes Grid
Date: 2021-12-16
Category: howto


# Problem

We've successfully [implemented user authentication]({filename}user-auth-in-tanzu-tkg.md) in our TKG clusters. Now, we'd like to update the client ID/secret for our TKG Management Cluster.

# Solution

TKG uses Pinniped to support authentication, including to OIDC providers. However, exactly which Kubernetes object we need to update/reconfigure is not immediately obvious. Fortunately, we only need to update one object, and the cluster takes care of the rest for us. 

At a high level, here's what we'll do:

* Find the `pinniped-addon` secret, which contains our OIDC connection details, encoded in base64
* Decode the payload, update our configs
* Re-encode the configs, and update the payload in the `pinniped-addon`
* Observe and confirm success

As a reminder, everything we're doing here should be done to the Management Cluster. The downsteram workload clusters will inherit your update configs (yay, [ClusterAPI](https://cluster-api.sigs.k8s.io/)!).

<hr>

## Find the Existing Pinniped Config

NOTE: I highly recommend [k9s](https://github.com/derailed/k9s) when operating with your Kubernetes clusters. Moving around in a CLI has never been such a breeze for me, and it makes discoverability and tactical operations much faster.

In the tkg-system namespace, there's a secret called `$CLUSTER_NAME-pinniped-addon`. That secret has your OIDC configs in a base64-encoded payload. You'll want to fetch that secret. So if your k8s cluster is named "donkey", you'll do:

```
kubectl get secret donkey-pinniped-addon -n tkg-system -o yaml
```

The important part is the section `data.values.yaml`, as seen here:

```yaml
apiVersion: v1
data:
  values.yaml: ArbleGarbleRepeatingThisShouldBeBase64StuffsArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64StuffArbleGarbleRepeatingThisShouldBeBase64Stuffs
kind: Secret
metadata:
```

<hr>
## Decode and Update Pinniped Config

Take that base64 payload copy/paste into a file, then decode it. Suppose you put it in a file called `pinniped-config.b64`:

```
cat pinniped-config.b64 | base64 -d > pinniped-config.yml
```

Now edit that file to update your credentials. Mine looks something like this:

```yaml
#@data/values
#@overlay/match-child-defaults missing_ok=True
---
infrastructure_provider: aws
tkg_cluster_role: management
.
.
.
identity_management_type: oidc
pinniped:
  cert_duration: 2160h
  cert_renew_before: 360h
  supervisor_svc_endpoint: https://0.0.0.0:31234
  supervisor_ca_bundle_data: ca_bundle_data_of_supervisor_svc
  supervisor_svc_external_ip: 0.0.0.0
  supervisor_svc_external_dns: null
  upstream_oidc_client_id: REDACTED         # <---- here's your Client ID
  upstream_oidc_client_secret: REDACTED     # <---- here's your Client Secret
  upstream_oidc_issuer_url: https://some-okta-thing.com
```

<hr>
## Re-Encode and Upload

Once you've got things just the way you like it, it's time to update the values for real in the k8s management cluster

Re-encode:

```
cat pinniped-config.yml | base64 -w 0 
```

That will base64-encode the values and dump them to `stdout`. Note, that we're supplying the `-w 0` flag to be sure our value is all on one line. We cannot have any line breaks in this value.

Now edit the secret where you originally got the config:

```
kubectl edit secret donkey-pinniped-addon -n tkg-system
```

REMEMBER to be sure it's all one line, no extra line breaks, no extra indention. Details matter here.

After you save & quit, head on over to the `pinniped-supervisor` namespace and watch for the `post-deploy` pod to recreate. You'll know this is happening because its age will be very young.

```
NAME                                        AGE   
pinniped-post-deploy-job-557j7              1m 
pinniped-supervisor-bdfdcbbdf-cxrfj         1m      
pinniped-supervisor-bdfdcbbdf-zcx9w         1m 
```

The status of that `pinniped-post-deploy` pod should eventually turn to "Complete" and the logs should end with something like the following:

```
Successfully configured the Pinniped
```

Super simple, right? At this point, you have successfully reconfigured your Pinniped credentials! Test things out. If you still have issues, retrace your steps more carefully to see what went wrong. Remember, the details (indention in yaml, namespaces, encodings) matter.
