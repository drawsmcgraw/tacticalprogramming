Title: GPU-Enabled Kubernetes Clusters with Tanzu Kubernetes Grid
Date: 2021-05-24
Category: howto


# Stated Goal

We want easy GPU access for Kubernetes workloads in our TKG clusters. This is done by:

* Installing GPU device drivers on our Kubernetes worker nodes
* Installing the device plugins on our Kubernetes worker nodes
* Applying the appropriate labels to our Kubernetes worker nodes so that GPU workloads can find them.

The [Nvidia GPU Operator](https://github.com/NVIDIA/gpu-operator) does all three for us.


# I'm Impatient. Just Tell Me What to Type

If you just want to get up and running and move on with life, here you go.

```
# Create a Kubernetes cluster, specifying Ubuntu for our base image and the g3s instance type for worker nodes
OS_NAME=ubuntu NODE_MACHINE_TYPE=g3s.xlarge tanzu cluster create aws-ubuntu-gpu --plan=dev 

# Add the Nvidia gpu-operator Helm repo
helm repo add nvidia https://nvidia.github.io/gpu-operator 
helm repo update 

# Deploy the gpu operator, this time into its own namespace
kubectl create ns test-operator 
helm install -n test-operator --wait --generate-name nvidia/gpu-operator --set operator.defaultRuntime=containerd 
```


# Solution, Explained

When you run a gpu-enabled workload on any machine, you have to install device drivers for that device. This is no different when you move to running that workload on a Kubernetes cluster. Sure, you can manually install the drivers on your Kubernetes workloads (or automate it the manual installation) but that's not how Kubernetes works. You don't want to have to manage _the machines_ in your cluster - you want to manage your cluster. Hence, the Nvidia GPU Operator.

For a nice, detailed writeup of the Nvidia GPU Operator, see [this writeup](https://developer.nvidia.com/blog/nvidia-gpu-operator-simplifying-gpu-management-in-kubernetes/) on their site. 

With that, let's walk through those commands.

## Deploy a GPU-enabled Kubernetes Cluster

We're using Tanzu to create our Kubernetes cluster. There are multiple ways to achieve this, this command is but one of those ways.

```
OS_NAME=ubuntu NODE_MACHINE_TYPE=g3s.xlarge tanzu cluster create aws-ubuntu-gpu --plan=dev 
```

With the `tanzu` cli, you can configure various profiles via config files or, as we did above, you can use environment variables. When deploying to AWS, `tanzu cluster create` will default to using Amazon Linux 2 as the base OS. We override this with the `OS_NAME` environment variable. Likewise, we use `NODE_MACHINE_TYPE` to specify an instance type that has a GPU attached to it.

See [the docs on Tanzu](https://docs.vmware.com/en/VMware-Tanzu-Kubernetes-Grid/1.3/vmware-tanzu-kubernetes-grid-13/GUID-tanzu-config-reference.html) for more details on how to configure TKG.

See [the AWS docs](https://docs.aws.amazon.com/dlami/latest/devguide/gpu.html) for other GPU-enabled instance types.

Once complete, you can fetch the credentials to your cluster with:

```
tanzu cluster kubeconfig get aws-ubuntu-gpu --admin
```

Next, is putting the GPU operator on there.

## Deploy the Nvidia GPU Operator

Super simple, just add the Helm repo and deploy, specifying the `containerd` run time since TKG clusters use ContainerD instead of Docker (the default runtime for the operator is Docker).

```
helm repo add nvidia https://nvidia.github.io/gpu-operator 
helm repo update 

# Put the operator in its own namespace for easy management
kubectl create ns test-operator 
helm install \
  -n test-operator \
  --wait \
  --generate-name \
  nvidia/gpu-operator \
  --set operator.defaultRuntime=containerd 
```

This will take some time, as the operator is going to detect the kernel version on your Kubernetes worker node, fetch & install the driver, and install the plugin, _and_ label the appropriate Kubernetes worker nodes. 

A good indicator that the install process is complete (or nearly so), is to glance into the `gpu-operator-resources` namespace:

```
$ kubectl get pods -n gpu-operator-resources
NAME                                       READY   STATUS      RESTARTS   AGE
nvidia-container-toolkit-daemonset-wwzfn   1/1     Running     0          3m36s
nvidia-device-plugin-daemonset-pwfq7       1/1     Running     0          101s
nvidia-device-plugin-validation            0/1     Completed   0          92s
nvidia-driver-daemonset-skpn7              1/1     Running     0          3m27s
nvidia-driver-validation                   0/1     Completed   0          3m
```

## Test, and profit.

I just used a simple workload [from the Kubernetes docs](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/), copy/pasted here for ease.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: cuda-vector-add
spec:
  restartPolicy: OnFailure
  containers:
    - name: cuda-vector-add
      # https://github.com/kubernetes/kubernetes/blob/v1.7.11/test/images/nvidia-cuda/Dockerfile
      image: "k8s.gcr.io/cuda-vector-add:v0.1"
      resources:
        limits:
          nvidia.com/gpu: 1 # requesting 1 GPU
```

The logs from that pod should look something like this on success:
```
kubectl logs cuda-vector-add
nvidia 34037760 47 nvidia_modeset,nvidia_uvm, Live 0xffffffffc05da000 (POE)
[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

Congrats! You now have a GPU-enabled Kubernetes cluster. This showed AWS, but for another cloud, all you'd need to do is specify the appropriate GPU-enabled instance. Everything else is the same.

# Conclusion

If you're looking for an easy way to get GPU-enabled Kubernetes clusters, you're just about out of excuses now. Between VMware and Nvidia, you're about 30 minutes away from your first cluster where you can start experimenting with the new platform. Enjoy!

