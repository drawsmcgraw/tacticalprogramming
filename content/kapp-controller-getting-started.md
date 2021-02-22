Title: kapp-controller Getting Started
Date: 2021-02-22
Category: howto


# Problem

As of today, there is no single answer to the question "_How do I deploy my workload?_". Helm Chart? A set of yaml files? _Templated_ yaml files?

And not just user-facing apps - how do I consistently deploy ingress controllers? K8s cluster user auth services? Diagnostics, metrics, and so forth? 

We need one answer to this question. Enter `kapp` and `kapp-controller`.

In this post, we're going to focus on `kapp-controller` and show how to set up a reconciliation loop that gives you the ability to push a new version of your workload into your Kubernetes cluster with just a `git push` (hi Gitops!).


# Solution

[The Docs](https://github.com/vmware-tanzu/carvel-kapp-controller/tree/develop/docs) are going to do a better job than me but, in a sentence, kapp-controller is a small workload that looks for new "apps" in your Kubernetes cluster. Upon discovery of an app (or an update to an existing one), kapp-controller will deploy (or update) that workload. Also, feel free to give the walkthrough a quick spin. It's short and completely worth your time.

I should note here that "app" is used very loosly. This is not just user-facing applications but, rather, any Kubernetes workload that you define. Examples include more complex workloads like a configured FluentBit deployment, an [Ingress Controller](https://projectcontour.io/), [inspection and diagnostics](https://sonobuoy.io/), and way, way more.

Let's walk through an example.

## Install kapp-controller

[Follow the docs](https://github.com/vmware-tanzu/carvel-kapp-controller/blob/develop/docs/install.md) (super simple) or just:

```
kapp deploy -a kc -f https://github.com/vmware-tanzu/carvel-kapp-controller/releases/latest/download/release.yml

# Or if you don't have `kapp` handy and don't want to make the jump yet, you can kubectl it too. 
# It just won't be as easily-removed or tracked.
kubectl apply -f https://github.com/vmware-tanzu/carvel-kapp-controller/releases/latest/download/release.yml
```

## Allow kapp-controller to manage a namespace

This is done by creating a service account, role, and RoleBinding. In this example, we're sticking with the `default` namespace but you can choose what you want in your deployment.

The easy copy/paste is below:

```
kapp deploy -a default-ns-rbac -f https://raw.githubusercontent.com/vmware-tanzu/carvel-kapp-controller/develop/examples/rbac/default-ns.yml
```

As of this writing, that file looks like this:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: default-ns-sa
  namespace: default
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: default-ns-role
  namespace: default
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: default-ns-role-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: default-ns-sa
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: default-ns-role
```

That's it! kapp-controller is installed and has permissions to work in the `default` namespace.

## Define Your Application

kapp-controller can fetch workloads (read: "apps") from a variety of sources: Git repos, plain http(s) endpoints, etc. See [the docs](https://github.com/vmware-tanzu/carvel-kapp-controller/blob/develop/docs/app-spec.md) for the options and configs. 

For this example (and simplicity), we're fetching from an open Git repo. Let's see what that spec looks like:

```yaml
#
# simple-app.yml
#
apiVersion: kappctrl.k14s.io/v1alpha1

# We're defining an app...
kind: App
metadata:
  name: exposed-simple-app
  namespace: default
spec:

  # What service account will run this app?
  serviceAccountName: default-ns-sa

  # Where is the app coming from?
  fetch:
  - git:
      url: https://gitlab.com/drawsmcgraw/simple-kapp-deployment
      ref: origin/master

      # We have a directory, named 'app', in the root of our repo.
      # Files describing the app (i.e. pod, service) are in that directory.
      subPath: app

  # No templating yet...
  template:
  - ytt: {}
  deploy:
  - kapp: {}
```

That's the high-level abstraction, but what about the app itself? Let's do that right now.

```yaml
#!
#! app-spec.yml
#!
#@ load("@ytt:data", "data")

#@ def labels():
simple-app: ""
#@ end

---
apiVersion: v1
kind: Service
metadata:
  namespace: default
  name: simple-app
spec:
  type: LoadBalancer
  ports:
  - port: #@ data.values.svc_port
    targetPort: #@ data.values.app_port
  selector: #@ labels()
---
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: default
  name: simple-app
spec:
  selector:
    matchLabels: #@ labels()
  template:
    metadata:
      labels: #@ labels()
    spec:
      containers:
      - name: simple-app
        image: docker.io/dkalinin/k8s-simple-app@sha256:4c8b96d4fffdfae29258d94a22ae4ad1fe36139d47288b8960d9958d1e63a9d0
        env:
        - name: HELLO_MSG
          value: #@ data.values.hello_msg
```

The astute reader will notice some templating in that file. Namely, the selectors, the ports for the service, and (notably) the message our app will use to greet our users (see the final line). The templating is also why we use `#!` for comments instead of `#`. So where do those values come from? From our values file:

```yaml
#!
#! app-values.yml
#!
#@data/values
---
svc_port: 80
app_port: 80
hello_msg: "kapp controller ftw"
```

That's all! Three files (and, of course, a container image that lives in a repo but that's a topic for another post).

## Create Your Git Repo

kapp-controller can fetch resources from a variety of sources but we're going with the Git repo option. That being the case, we need to make a Git repo.

Feel free to [fork my repo](https://gitlab.com/drawsmcgraw/simple-kapp-deployment) or start one of your own. What matters is that, for the examples in this blog post, it looks like this:

```text
simple-kapp-deployment/
├── app
│   ├── app-spec.yml    <-- kapp-controller will deploy this
│   └── app-values.yml  <-- and this
└── crd
    └── simple-app.yml  <-- You'll deploy this
```

## Deploy!

kapp-controller is deployed and given permissions to operate in your `default` namespace. Now let's deploy.

```
kapp deploy -a exposed-simple-app -f simple-app.yml
```

Upon successful deploy, you should see a pod and a `LoadBalancer` service created for you:

```
$ kubectl get pods
NAME                        READY   STATUS    RESTARTS   AGE
simple-app-76bd586c-5cn7f   1/1     Running   0          43m

$ kubectl get svc
NAME         TYPE           CLUSTER-IP    EXTERNAL-IP                                                              PORT(S)        AGE
simple-app   LoadBalancer   100.70.8.41   abbf47c4388bb4054cd0623201bf1623-982265869.us-east-2.elb.amazonaws.com   80:30216/TCP   51m
```

Fetch the external IP / FQDN and hit it with your browser or `curl`:

```

$ curl abbf47c4388bb4054cd0623201bf1623-982265869.us-east-2.elb.amazonaws.com
<h1>Hello kapp controller ftw!</h1>
```

Super simple, but neat, right?

## Change, Deploy and Observe

Let's change our deployment parameters. We could change anything about it - number of pods, type of service, etc. For this demo, though, we're going to make a simple, but noticeable change in the output. The app pulls the message from an environment variable, `HELLO_MSG`. If we change that, it will change the output. 

Go back to `app-values.yml` and find the line for `hello_msg`. This is the value that's used when `app-spec.yml` gets rendered. So changing this changes the environment variable, which changes the output. Change that value to anything meaningful to you. For this example, let's go with `k8s rocks my socks`.

Here's a diff, for reference:

```
 ---
 svc_port: 80
 app_port: 80
-hello_msg: "kapp controller ftw"
+hello_msg: "k8s rocks my socks"
```

Once you've made changes, you can `git commit` and `git push`. But before you do that, tail the logs of `kapp-controller` so you can follow along:

```
# Tail kapp-controller's logs.
# Use `kubectl -n kapp-controller get pods` to get your exact pod name.
kubectl -n kapp-controller logs -f kapp-controller-5c94d969dc-45hhg
```

Now commit, push, and watch the logs:

```
{"level":"info","ts":1614022522.823228,"logger":"kc.controller.ar","msg":"Started deploy","request":"default/exposed-simple-app"}
{"level":"info","ts":1614022525.4390993,"logger":"kc.controller.ar","msg":"Updating status","request":"default/exposed-simple-app","desc":"flushing: flush all"}
{"level":"info","ts":1614022526.118631,"logger":"kc.controller.ar","msg":"Updating status","request":"default/exposed-simple-app","desc":"marking last deploy"}
{"level":"info","ts":1614022526.4596887,"logger":"kc.controller.ar","msg":"Updating status","request":"default/exposed-simple-app","desc":"marking inspect completed"}
{"level":"info","ts":1614022526.47044,"logger":"kc.controller.ar","msg":"Updating status","request":"default/exposed-simple-app","desc":"marking reconcile completed"}
{"level":"info","ts":1614022526.4801362,"logger":"kc.controller.ar","msg":"Completed deploy","request":"default/exposed-simple-app"}
{"level":"info","ts":1614022526.4801614,"logger":"kc.controller.pr","msg":"Requeue after given time","request":"default/exposed-simple-app","after":34.206580832}
{"level":"info","ts":1614022526.4841988,"logger":"kc.controller.ar","msg":"Reconcile noop","request":"default/exposed-simple-app"}
{"level":"info","ts":1614022526.4842331,"logger":"kc.controller.pr","msg":"Requeue after given time","request":"default/exposed-simple-app","after":31.408593131}
```

kapp-controller detected a change in the workload and redeployed it for us! Let's see the app now:

```
$ curl abbf47c4388bb4054cd0623201bf1623-982265869.us-east-2.elb.amazonaws.com
<h1>Hello k8s rocks my socks!</h1>
```

There's our new message! 

## Why Does This Matter?

Okay, so changing an environment variable and redeploying isn't impressive. But what I need you to understand is that this applies to _so much more_ than just deploying/updating an application. This applies to anything you deploy with Kubernetes:

- standard logging solutions that you need on every k8s cluster (like a perfectly-manicured FluentBit deployment)
- value-add extentions that your users want (like federated user auth)
- even [more Kubernetes clusters](https://cluster-api.sigs.k8s.io/). 
- etc...

This is what _state enforcement_ looks like. kapp-controller will be sure that your workloads are running _in the specific way you need them running_, and it will use your repo as a _source of truth_. 

That last part is the big part - you can define your Kubernetes ecosystem as a rigidly-maintained repo, and kapp-controller will do the work of deploying those workloads for you. At this point, your only limitation is your own imagination.

Enjoy!
