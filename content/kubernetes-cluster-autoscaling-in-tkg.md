Title: Cluster Node Autoscaling in Tanzu Kubernetes Grid (TKG)
Date: 2021-10-19
Category: howto


# Problem

We need to reliably implement cluster autoscaling for our Kubernetes platform. How can we do that? And how can we know it's working?

# Solution

TKG uses the regular [Cluster Autoscaler](https://github.com/kubernetes/autoscaler) but makes it easy to configure. We'll ask TKG to enable Cluster Autoscaler for us, dial in a few options, and then test it out.

Note: As of this writing, the latest version of TKG is 1.4. This blog post is based on [the docs for that version](https://docs.vmware.com/en/VMware-Tanzu-Kubernetes-Grid/1.4/vmware-tanzu-kubernetes-grid-14/GUID-cluster-lifecycle-scale-cluster.html#scale-worker-nodes-with-cluster-autoscaler-0) as well as [a helpful blog post](https://little-stuff.com/2020/12/10/using-autoscaler-functionality-in-tanzu-kubernetes-grid-1-2-1/) by Chris Little.


## Create a Kubernetes Cluster with Autoscaling Enabled

Basically, we just need to set '`ENABLE_AUTOSCALER: true`' when deploying a TKG cluster. The simplest way to do this is to include it in your `cluster-config.yml`, or whichever config file you're maintaining for your cluster. There are some other options as well, which I'll lay out below. Most are already set to sane defaults.

For a complete description of all the values, see [the docs](https://docs.vmware.com/en/VMware-Tanzu-Kubernetes-Grid/1.4/vmware-tanzu-kubernetes-grid-14/GUID-tanzu-config-reference.html#autoscaler).

```yaml
#! ---------------------------------------------------------------------
#! Autoscaler related configuration
#! ---------------------------------------------------------------------
ENABLE_AUTOSCALER: true
AUTOSCALER_MAX_NODES_TOTAL: "0"
AUTOSCALER_SCALE_DOWN_DELAY_AFTER_ADD: "10m"
AUTOSCALER_SCALE_DOWN_DELAY_AFTER_DELETE: "10s"
AUTOSCALER_SCALE_DOWN_DELAY_AFTER_FAILURE: "3m"
AUTOSCALER_SCALE_DOWN_UNNEEDED_TIME: "10m"
AUTOSCALER_MAX_NODE_PROVISION_TIME: "15m"

# Each min/max pair (0,1,2) corresponds to an availability zone. 
# If you have a 'dev' cluster, you only need to fill in the min/max size for '0'.
# If you have a 'prod' cluster, you need to fill in all three pairs.
AUTOSCALER_MIN_SIZE_0: 3
AUTOSCALER_MAX_SIZE_0: 10
AUTOSCALER_MIN_SIZE_1:
AUTOSCALER_MAX_SIZE_1:
AUTOSCALER_MIN_SIZE_2:
AUTOSCALER_MAX_SIZE_2:
```

With that, it's as simple as creating a TKG cluster.

```shell
# NOTE: we created the file 'tkg-cluster-with-autoscaling.yml'
tanzu cluster create -f ~/.config/tanzu/tkg/cluster-configs/tkg-cluster-with-autoscaling.yml --plan dev aws-autoscale-01 -w 3
```
Once our cluster is alive, how do we know it worked? Two indicators.

### Examine the Management Cluster

The management cluster, in the `default` namespace, will have an autoscaling deployment created for your new cluster. It should be healthy.

```text
# Switch to our management cluster
$ kubectx us-east-2-mc-admin@us-east-2-mc
✔ Switched to context "us-east-2-mc-admin@us-east-2-mc".

$ kubectl -n default get deployments
NAME                                  READY   UP-TO-DATE   AVAILABLE   AGE
aws-autoscale-01-cluster-autoscaler   1/1     1            1           5d
```

### Examine the Workload Cluster

On the workload cluster (the TKG cluster you created), in the '`kube-system`' namespace, Cluster Autoscaler creates a configmap to track its status. You can view this config map.
```text
$ kubectx aws-autoscale-01-admin@aws-autoscale-01
✔ Switched to context "aws-autoscale-01-admin@aws-autoscale-01".

$ kubectl -n kube-system get configmap
NAME                                 DATA   AGE
cluster-autoscaler-status            1      5d


$ kubectl -n kube-system describe configmap cluster-autoscaler-status
Name:         cluster-autoscaler-status
Namespace:    kube-system
Labels:       <none>
Annotations:  cluster-autoscaler.kubernetes.io/last-updated: 2021-10-19 19:06:41.612291737 +0000 UTC

Data
====
status:
----
Cluster-autoscaler status at 2021-10-19 19:06:41.612291737 +0000 UTC:
Cluster-wide:
  Health:      Healthy (ready=4 unready=0 notStarted=0 longNotStarted=0 registered=4 longUnregistered=0)
               LastProbeTime:      2021-10-19 19:06:40.008835646 +0000 UTC m=+433068.513173981
               LastTransitionTime: 2021-10-14 18:49:01.674656828 +0000 UTC m=+10.178995230
  ScaleUp:     NoActivity (ready=4 registered=4)
               LastProbeTime:      2021-10-19 19:06:40.008835646 +0000 UTC m=+433068.513173981
               LastTransitionTime: 2021-10-18 15:11:12.255597844 +0000 UTC m=+332540.759936180
  ScaleDown:   NoCandidates (candidates=0)
               LastProbeTime:      2021-10-19 19:06:40.008835646 +0000 UTC m=+433068.513173981
               LastTransitionTime: 2021-10-18 15:27:44.207345103 +0000 UTC m=+333532.711683437

NodeGroups:
  Name:        MachineDeployment/default/aws-autoscale-01-md-0
  Health:      Healthy (ready=3 unready=0 notStarted=0 longNotStarted=0 registered=3 longUnregistered=0 cloudProviderTarget=3 (minSize=3, maxSize=10))
               LastProbeTime:      2021-10-19 19:06:40.008835646 +0000 UTC m=+433068.513173981
               LastTransitionTime: 2021-10-14 18:50:53.782671384 +0000 UTC m=+122.287009725
  ScaleUp:     NoActivity (ready=3 cloudProviderTarget=3)
               LastProbeTime:      2021-10-19 19:06:40.008835646 +0000 UTC m=+433068.513173981
               LastTransitionTime: 2021-10-18 15:11:12.255597844 +0000 UTC m=+332540.759936180
  ScaleDown:   NoCandidates (candidates=0)
               LastProbeTime:      2021-10-19 19:06:40.008835646 +0000 UTC m=+433068.513173981
               LastTransitionTime: 2021-10-18 15:27:44.207345103 +0000 UTC m=+333532.711683437



BinaryData
====

Events:  <none>
```

Great! So we now know that Cluster Autoscaler is installed, and it's configured our k8s cluster to have three worker nodes (see the '`Healthy (ready=3`' part in the output above). Let's test it.

## Testing Cluster Autoscaler

We have a 'dev' cluster, so that means one control plane node, and three worker nodes (we asked for three with the `-w 3` flag in the `tanzu cluster create command`).

```shell
$ kubectl get nodes
NAME                                       STATUS   ROLES                  AGE     VERSION
ip-10-0-0-148.us-east-2.compute.internal   Ready    <none>                 5d      v1.21.2+vmware.1
ip-10-0-0-154.us-east-2.compute.internal   Ready    <none>                 27h     v1.21.2+vmware.1
ip-10-0-0-218.us-east-2.compute.internal   Ready    control-plane,master   5d      v1.21.2+vmware.1
ip-10-0-0-250.us-east-2.compute.internal   Ready    <none>                 4d22h   v1.21.2+vmware.1
```
We set a max of 10 nodes, so we should be able to test this out. Let's look at a super simple toy app, say `php-apache`.

```yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  selector:
    matchLabels:
      run: php-apache
  replicas: 3
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: k8s.gcr.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
  labels:
    run: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
```

Let's deploy it.

```shell
$ kapp deploy -a load-test -f php-apache.yml 
Target cluster 'https://aws-autoscale-01-apiserver-753085411.us-east-2.elb.amazonaws.com:6443' (nodes: ip-10-0-0-218.us-east-2.compute.internal, 3+)

Changes

Namespace  Name        Kind        Conds.  Age  Op      Op st.  Wait to    Rs  Ri  
default    php-apache  Deployment  -       -    create  -       reconcile  -   -  
^          php-apache  Service     -       -    create  -       reconcile  -   -  

Op:      2 create, 0 delete, 0 update, 0 noop
Wait to: 2 reconcile, 0 delete, 0 noop

Continue? [yN]: y

3:16:46PM: ---- applying 2 changes [0/2 done] ----
3:16:46PM: create service/php-apache (v1) namespace: default
3:16:47PM: create deployment/php-apache (apps/v1) namespace: default
3:16:47PM: ---- waiting on 2 changes [0/2 done] ----
3:16:47PM: ok: reconcile service/php-apache (v1) namespace: default
3:16:47PM: ongoing: reconcile deployment/php-apache (apps/v1) namespace: default
3:16:47PM:  ^ Waiting for 3 unavailable replicas
3:16:47PM:  L ok: waiting on replicaset/php-apache-78cc655ff (apps/v1) namespace: default
3:16:47PM:  L ongoing: waiting on pod/php-apache-78cc655ff-w4zk7 (v1) namespace: default
3:16:47PM:     ^ Pending: ContainerCreating
3:16:47PM:  L ongoing: waiting on pod/php-apache-78cc655ff-qmsdd (v1) namespace: default
3:16:47PM:     ^ Pending: ContainerCreating
3:16:47PM:  L ongoing: waiting on pod/php-apache-78cc655ff-fp2fp (v1) namespace: default
3:16:47PM:     ^ Pending: ContainerCreating
3:16:47PM: ---- waiting on 1 changes [1/2 done] ----
3:16:49PM: ok: reconcile deployment/php-apache (apps/v1) namespace: default
3:16:49PM: ---- applying complete [2/2 done] ----
3:16:49PM: ---- waiting complete [2/2 done] ----

Succeeded
```

And check for success:

```shell
$ kubectl get pods
NAME                         READY   STATUS    RESTARTS   AGE
php-apache-78cc655ff-fp2fp   1/1     Running   0          39s
php-apache-78cc655ff-qmsdd   1/1     Running   0          39s
php-apache-78cc655ff-w4zk7   1/1     Running   0          39s
```

Okay, great. But what if we make a ludicrous request? Something beyond what three nodes can handle?

```shell
$ sed -i 's/replicas: 3/replicas: 300/g' php-apache.yml
```

And then....

```text
$ kapp deploy -a load-test -f php-apache.yml 
Target cluster 'https://aws-autoscale-01-apiserver-753085411.us-east-2.elb.amazonaws.com:6443' (nodes: ip-10-0-0-218.us-east-2.compute.internal, 3+)

Changes

Namespace  Name        Kind        Conds.  Age  Op      Op st.  Wait to    Rs  Ri  
default    php-apache  Deployment  2/2 t   3m   update  -       reconcile  ok  -  

Op:      0 create, 0 delete, 1 update, 0 noop
Wait to: 1 reconcile, 0 delete, 0 noop

Continue? [yN]: y

.
.
.
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-5xq9v (v1) namespace: default
3:21:16PM:     ^ Pending: Unschedulable (message: 0/4 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate, 3 Insufficient cpu.)
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-5wzns (v1) namespace: default
3:21:16PM:     ^ Pending: Unschedulable (message: 0/4 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate, 3 Insufficient cpu.)
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-5mv4j (v1) namespace: default
3:21:16PM:     ^ Pending
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-5mkvj (v1) namespace: default
3:21:16PM:     ^ Pending: ContainerCreating
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-5c5qk (v1) namespace: default
3:21:16PM:     ^ Pending: Unschedulable (message: 0/4 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate, 3 Insufficient cpu.)
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-57q2m (v1) namespace: default
3:21:16PM:     ^ Pending
3:21:16PM:  L ongoing: waiting on pod/php-apache-78cc655ff-4g4lm (v1) namespace: default
.
.
.

```

Ah! We're all out of space on our Kubernetes cluster! 

```
Unschedulable (message: 0/4 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate, 3 Insufficient cpu.)
```

This is telling us that there are 4 nodes, but none are available. And by the way, one of them is the control plane so we can't even deploy on that.

Let's see how many pods are failing to deploy.

```shell

Every 2.0s: kubectl get pods | grep '0/1' | wc -l                              samus: Tue Oct 19 15:23:01 2021

152
```

Okay, now let's check that configmap on our workload cluster.

```text
 NodeGroups:                                                                                   
   Name:        MachineDeployment/default/aws-autoscale-01-md-0                                
   Health:      Healthy (ready=8 unready=0 notStarted=0 longNotStarted=0 registered=8 longUnreg
                LastProbeTime:      2021-10-19 19:25:42.319883574 +0000 UTC m=+434210.824221910
                LastTransitionTime: 2021-10-14 18:50:53.782671384 +0000 UTC m=+122.287009725   
   ScaleUp:     NoActivity (ready=8 cloudProviderTarget=8)                                     
                LastProbeTime:      2021-10-19 19:25:42.319883574 +0000 UTC m=+434210.824221910
                LastTransitionTime: 2021-10-19 19:22:31.744698667 +0000 UTC m=+434020.249037002

```

We can see that it's already scaling up to 8 worker nodes. In fact, by the time I got to checking the config map, it _already_ scaled up to 8 and joined the new machines to the cluster. Let's see the k8s worker node count.

```shell
NAME                                       STATUS   ROLES                  AGE     VERSION
ip-10-0-0-130.us-east-2.compute.internal   Ready    <none>                 4m58s   v1.21.2+vmware.1
ip-10-0-0-148.us-east-2.compute.internal   Ready    <none>                 5d      v1.21.2+vmware.1
ip-10-0-0-154.us-east-2.compute.internal   Ready    <none>                 28h     v1.21.2+vmware.1
ip-10-0-0-203.us-east-2.compute.internal   Ready    <none>                 5m3s    v1.21.2+vmware.1
ip-10-0-0-218.us-east-2.compute.internal   Ready    control-plane,master   5d      v1.21.2+vmware.1
ip-10-0-0-226.us-east-2.compute.internal   Ready    <none>                 5m      v1.21.2+vmware.1
ip-10-0-0-250.us-east-2.compute.internal   Ready    <none>                 4d23h   v1.21.2+vmware.1
ip-10-0-0-33.us-east-2.compute.internal    Ready    <none>                 5m      v1.21.2+vmware.1
ip-10-0-0-72.us-east-2.compute.internal    Ready    <none>                 4m59s   v1.21.2+vmware.1
```

That's 8 nodes. Sweet! How about our `kapp` command? Did it ever reconcile?

```shell
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-2d8ts (v1) namespace: default
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-29xkp (v1) namespace: default
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-27f62 (v1) namespace: default
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-26vq5 (v1) namespace: default
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-268m5 (v1) namespace: default
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-252qt (v1) namespace: default
3:23:17PM:  L ok: waiting on pod/php-apache-78cc655ff-22dcd (v1) namespace: default
3:23:18PM: ok: reconcile deployment/php-apache (apps/v1) namespace: default
3:23:18PM: ---- applying complete [1/1 done] ----
3:23:18PM: ---- waiting complete [1/1 done] ----

Succeeded
```

Yes. `kapp` waited for the deployment to succeed before returning control. 

And all the while, our 'watch' command was ticking down to zero:

```shell
Every 2.0s: kubectl get pods | grep '0/1' | wc -l                              samus: Tue Oct 19 15:28:28 2021

0
```

And the pods are all deployed.

```shell
$ kubectl get pods | wc -l
301
```

Success!

What about scaling _down_?

## Scale Down the Kubernetes Cluster

TL;DR - Do nothing. Cluster Autoscaler does this for you. Read on for more.

The default behavior is for Cluster Autoscaler to check for a "scale down" opportunity every ten minutes. That means if we scale down our requested number of pods, and wait a short period, the Kubernetes cluster will scale down. Let's do that.

```shell
$ sed -i 's/replicas: 300/replicas: 3/g' php-apache.yml

$ kapp deploy -a load-test -f php-apache.yml
```

Now we wait, and check back in. After a time, the unneeded nodes will become unschedulable, showing that they're being decomissioned.

```
$ kubectl get nodes
NAME                                       STATUS                        ROLES                  AGE     VERSION
ip-10-0-0-130.us-east-2.compute.internal   NotReady,SchedulingDisabled   <none>                 20m     v1.21.2+vmware.1
ip-10-0-0-148.us-east-2.compute.internal   Ready                         <none>                 5d      v1.21.2+vmware.1
ip-10-0-0-154.us-east-2.compute.internal   Ready                         <none>                 28h     v1.21.2+vmware.1
ip-10-0-0-203.us-east-2.compute.internal   NotReady,SchedulingDisabled   <none>                 20m     v1.21.2+vmware.1
ip-10-0-0-218.us-east-2.compute.internal   Ready                         control-plane,master   5d      v1.21.2+vmware.1
ip-10-0-0-226.us-east-2.compute.internal   Ready                         <none>                 20m     v1.21.2+vmware.1
ip-10-0-0-250.us-east-2.compute.internal   NotReady,SchedulingDisabled   <none>                 4d23h   v1.21.2+vmware.1
ip-10-0-0-33.us-east-2.compute.internal    NotReady,SchedulingDisabled   <none>                 20m     v1.21.2+vmware.1
ip-10-0-0-72.us-east-2.compute.internal    NotReady,SchedulingDisabled   <none>                 20m     v1.21.2+vmware.1
```

And after another period of time, they'll be gone entirely.

```
$ kubectl get nodes
NAME                                       STATUS                        ROLES                  AGE   VERSION
ip-10-0-0-148.us-east-2.compute.internal   Ready                         <none>                 5d    v1.21.2+vmware.1
ip-10-0-0-154.us-east-2.compute.internal   Ready                         <none>                 28h   v1.21.2+vmware.1
ip-10-0-0-218.us-east-2.compute.internal   Ready                         control-plane,master   5d    v1.21.2+vmware.1
ip-10-0-0-226.us-east-2.compute.internal   Ready                         <none>                 22m   v1.21.2+vmware.1
```

And we're back down to three worker nodes.

What about changing these configs? While there's not a direct knob to dial, this is all using Cluster API, so there's a way to do that as well.

## Edit Min/Max Node Configurations

Since this solution is based on Cluster API, we can jump into the management cluster and edit the Annotations for our Machine Deployment that's part of our workload cluster. Need a refresher on Machine Deployments? See [the relevant section in the Cluster API docs](https://cluster-api.sigs.k8s.io/user/concepts.html#machinedeployment).

Let's find, and edit, our Machine Deployment.

```
$ kubectx us-east-2-mc-admin@us-east-2-mc
✔ Switched to context "us-east-2-mc-admin@us-east-2-mc".

$ kubectl get machinedeployments
NAME                    PHASE     REPLICAS   READY   UPDATED   UNAVAILABLE
aws-autoscale-01-md-0   Running   3          3       3         

$ kubectl edit machinedeployments/aws-autoscale-01-md-0
```

Here's the relevant section:

```yaml
apiVersion: cluster.x-k8s.io/v1alpha3
kind: MachineDeployment
metadata:
  annotations:
    cluster.k8s.io/cluster-api-autoscaler-node-group-max-size: "10"
    cluster.k8s.io/cluster-api-autoscaler-node-group-min-size: "3"
```

We're currently at a max size of 10. If we need to change that, just change it here, like any on-the-fly Kubernetes object. And then _remember to update your config file_ if necessary. We don't want to introduce config drift. 

## Conclusion

And that's it! We can now turn on Cluster Autoscaler for our Kubernetes nodes, see it take action, and change the configs if necessary. Now we can get back to the important work, helping devs onboard their apps to our Kubernetes platform.
