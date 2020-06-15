Title: Simple MongoDB Deployment in Kubernetes with Private Access
Date: 2020-06-15
Category: howto


# Problem

We want to deploy a simple (read: development) instance of MongoDB in our Kubernetes cluster with as little work as possible. Additionally, we'd like to make that MongoDB deployment available to services outside the k8s cluster _but not_ outside our VPC


# Solution

Use Bitnami's [MongoDB helm chart](https://github.com/bitnami/charts/tree/master/bitnami/mongodb) to deploy MongoDB, then expose the service via a Kubernetes service of type `LoadBalancer`.

# Assumptions

We assume you:

1. are in AWS (_not_ EKS, just living in AWS) 
1. already have a Kubernetes and 
1. have appropriately tagged your public subnets to allow Kubernetes to create load balancers for you on your behalf.

# Configure a StorageClass in Kubernetes

We want to use Dynamic Provisioning so that we don't have to create storage ahead of time (i.e. less work for us). In order for that to succeed, we need to define at least one storageClass and reference it during our `helm install`. Let's create a `standard` storageClass. We're in AWS so we'll use one that uses the EBS backend.

*aws-storageclass.yml*
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  
  # We can use any name so long as we reference it correctly
  name: standard

  # Tell k8s this is our default storageClass
  annotations: 
    storageclass.kubernetes.io/is-default-class: "true"

# Use the EBS backend
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2

# Can also be 'Retain' but we choose delete so we don't accrue volumes during testing.
reclaimPolicy: Delete
allowVolumeExpansion: true
mountOptions:
  - debug
volumeBindingMode: Immediate
```

Apply the file:

```
kubectl apply -f aws-storageClass.yml
```

Confirm success

```
 kubectl get storageclass
NAME                 PROVISIONER             AGE
standard (default)   kubernetes.io/aws-ebs   4h1m
```

# Gather Bitnami Helm Chart and Config File

To use Bitnami's helm chart, you'll need to add it to your helm repo listing.

```
helm repo add bitnami https://charts.bitnami.com/bitnami
```

Create the values file to override the defaults.

*mongo-custom-values.yml*
```yaml
# We're testing, so 1Gi is fine
persistence:
  size: 1Gi

# Use the initContainer to change permissions for us so Mongo can write to the volume
volumePermissions.enabled: true

# Use the storageClass we created earlier
global:
  storageClass: standard

service:

  # Make AWS load balancer
  type: LoadBalancer

  # Tell AWS to make our load balancer an internal LB
  annotations: {
    service.beta.kubernetes.io/aws-load-balancer-internal: 0.0.0.0/0
  }
```

# Deploy

```
helm install mongo bitnami/mongodb -f mongo-custom-values.yml
```

After a moment, Kubernetes will create the volumes, ELB, and pod. Confirm.

```
kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
mongo-mongodb-7b64d775b4-hb5gd   1/1     Running   0          71m

kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS   REASON   AGE
pvc-ec937eff-2dd7-4bdc-ac88-12f78a535d70   1Gi        RWO            Delete           Bound    default/mongo-mongodb   standard                71m

kubectl get pvc
NAME            STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
mongo-mongodb   Bound    pvc-ec937eff-2dd7-4bdc-ac88-12f78a535d70   1Gi        RWO            standard       71m

kubectl get svc
NAME            TYPE           CLUSTER-IP       EXTERNAL-IP                                                                        PORT(S)           AGE
mongo-mongodb   LoadBalancer   10.100.200.209   internal-aaa0689bfe6dc4f29a66c8a1daf9409a-1104846976.us-east-2.elb.amazonaws.com   27017:31634/TCP   72m
```

If any of the above is showing problems, something went wrong. Use `kubectl describe <broken-thing>` to troubleshoot.

# Profit

Test success by running a pod inside your k8s cluster, using the ELB's FQDN as the host (Note: the output of `helm install` has helpful output to help you fetch the admin creds as well as running this test command).

```
kubectl run \
--namespace default \
mongo-mongodb-client \
--rm --tty -i \
--restart='Never' \
--image gcr.io/sys-2b0109it/demo/bitnami/mongodb:4.2.8-centos-7-r0 \
--command -- mongo admin --host mongo-mongodb --authenticationDatabase admin -u root -p $MONGODB_ROOT_PASSWORD

If you don't see a command prompt, try pressing enter.

> help
	db.help()                    help on db methods
	db.mycoll.help()             help on collection methods
	sh.help()                    sharding helpers
	rs.help()                    replica set helpers
    .
    .
    .
```

Success! You now have an instance of MongoDB running in your k8s cluster, accessible only to resources inside your VPC. This model applies to any service, not just MongoDB. 


# Credits

Credit goes to the following sites/pages for details I would have otherwise missed.

- https://medium.com/@GiantSwarm/using-kubernetes-loadbalancer-services-on-aws-5c22f932d0c9
- https://kubernetes.io/docs/concepts/cluster-administration/cloud-providers/#aws
