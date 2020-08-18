Title: Vsphere 7 with Kubernetes Quickstart - User Edition
Date: 2020-08-18
Category: howto


# Problem

You got a Kubernetes! Your Vsphere team has given you access to a Vsphere Workload Management Namespace, which means you can start making clusters! But how, exactly? Assuming they didn't give you enough directions, how do you from 'access' to 'I have a Kubernetes workload!' ?


# Solution

At a high level, you'll need to log into the Supervisor cluster built into Vsphere. After doing that, you can target the supervisor _namespace_ created for you and get to work creating clusters and using them.

## Download the Vsphere plugin for kubectl

You should have received a URL where you can download binaries as well as log into the Supervisor cluster. These are often the same URL. For this post, we'll go with the URL `wcp.vmwsddc.lab`. Navigate there in your browser and download the `kubectl` and `kubectl-vsphere` binaries and put them on your path.

## Create a workspace for interacting with Vsphere with Kubernetes

NOTE: If you're just getting started with k8s clusters and don't have any `$KUBECONFIG` configured and you're not working with any k8s clusters right now, feel free to skip this section.

I like to keep things clean, so I use [direnv](https://direnv.net/) to manage access to multiple k8s clusters and other environments. I have a directory dedicated to working with Vsphere with Kubernetes. Here's a snippet of the relevant part of my `.envrc`
```
# Use vsphere kubectl plugin
export PATH=$PWD/bin:$PATH
unset  KUBECONFIG
```

In my workspace directory, I keep a separate `/bin` directory, where I store the kubectl version I want to use and the vsphere plugin.
```
.
├── bin
│   ├── kubectl
│   ├── kubectl-vsphere
│   └── vsphere-plugin.zip
├── dmalone-k8s-test-01.yml
└── sample-workloads
    ├── hello-k8s.yml
    ├── nginx-deployment.yml
    ├── nginx-lb-pod.yml
    └── nginx-nodeport-pod.yml
```

This way, I don't affect any other parts of my system and I guarantee the right version of `kubectl` gets used.

## Log into supervisor namespace and change context

Using the binaries you just downloaded, log into the Supervisor cluster. This will likely be the same URL where you downloaded the binaries.

```
kubectl vsphere login --insecure-skip-tls-verify --server=wcp.vmwsddc.lab

Username: dmalone
Password: 
Logged in successfully.

You have access to the following contexts:
   supervisor-ns-01
   wcp.vmwsddc.lab

If the context you wish to use is not in this list, you may need to try
logging in again later, or contact your cluster administrator.

To change context, use `kubectl config use-context <workload name>`
```

Upon successful login, you'll see all the Supervisor namespaces you have access to. In this case, we have access to the `supervisor-ns-01` Supervisor namespace. This is the namespace we'll talk to in order to create our workload clusters.

```
kubectl config use-context supervisor-ns-01
```

A note: up until now, I've been referring to `wcp.vmwsddc.lab` as the "Supervisor cluster". That's because this is the cluster that is ultimately responsible for creation/management of your workload Kubernetes clusters. When you target `supervisor-ns-01`, you're targeting the namespace carved out for you and your team. This is the "Vsphere Workload Namespace" that your Vsphere admin made for you, and is where permissions, quotas, etc are controlled from.

## Make a Kubernetes

Every Vsphere environment has its own properties and characteristics. To keep things as simple as possible, let's start with a simple, generic k8s cluster just to get off the ground.

```yaml
# test-k8s-01.yml
apiVersion: run.tanzu.vmware.com/v1alpha1               # TKG API endpoint
kind: TanzuKubernetesCluster                            # required parameter
metadata:
  name: test-k8s-test-01                                # cluster name, user defined 
  namespace: supervisor-ns-01                           # supervisor namespace
spec:
  distribution:
    version: v1.17                                      # resolved kubernetes version
  topology:
    controlPlane:
      count: 1                                          # number of control plane nodes
      class: best-effort-small                          # vmclass for control plane nodes
      storageClass: vsan-default-storage-policy         # storageclass for control plane
                                                        #   use 'kubectl describe namespace SUPERVISOR-NAMESPACE'
                                                        #   to find the storageClasses available to you
    workers:
      count: 3                                          # number of worker nodes
      class: best-effort-small                          # vmclass for worker nodes
      storageClass: vsan-default-storage-policy         # storageclass for worker nodes
```

For more on example yaml files and guidance, see [the Docs](https://docs.vmware.com/en/VMware-vSphere/7.0/vsphere-esxi-vcenter-server-70-vsphere-with-kubernetes-guide.pdf#unique_15)

With that, and with our Supervisor namespace targeted, let's fire!

```
kubectl apply -f test-k8s-01.yml
```

You can check on the status just as you would any other Kubernetes object, with `kubectl (get | describe)`. For instance, here's a successful cluster created:
```
kubectl get tanzukubernetesclusters
NAME                  CONTROL PLANE   WORKER   DISTRIBUTION                     AGE   PHASE
test-k8s-01           1               3        v1.17.8+vmware.1-tkg.1.5417466   20h   running
```

## Log into your Kubernetes and deploy!

Upon successful creation (i.e. you can list your cluster and get output similar to the above), you can now target that k8s cluster and get to work.

```
kubectl config set-context test-k8s-01
```

Let's deploy a boring Nginx pod:
```yaml
# boring-nginx.yml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: nginx
  name: nginx
spec:
  containers:
  - image: nginx
    name: nginx
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

And now deploy:

```
kubectl apply -f boring-nginx.yml
```

You should now see your pod successfully deployed. Check with `kubectl get pods` or, even better, use the [k9s](https://k9scli.io/) command line tool for some of the best k8s experience you'll have today.
```
kubectl get pods
NAME                    READY   STATUS    RESTARTS   AGE
nginx                   1/1     Running   0          3h5m
```

There are so many ways to go from here (ingress, configuring container registries, and more) but they're beyond the scope of this post. Enjoy your new pushbutton Kubernetes and _get to work_!

