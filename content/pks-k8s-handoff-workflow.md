Title: PKS - Proper Kubernetes Cluster Creation and Handoff
Date: 2020-04-24
Category: howto


_Note:_ This will be light on details. The exact commands to run, unfortunately, are an exercise left to the reader. This post is more of a tactical guideline to jog your memory. The author regrets the lack of detail.

# Problem

Creating your k8s clusters is just the first step. How do you hand the cluster off to the right people so you don't have to worry about it anymore? How do you give them access while keeping others out? 

# Solution

The workflow, at a high level, as as follows:

* Enable OIDC in the PKS-API server.
* Create the requisite users (either directly in UAA or in LDAP if you're using the LDAP backend).
* Create a Kubernetes cluster (this must be done *after* enabling OIDC).
* Create the k8s role.yml and apply.
* Create the k8s role-binding.yml and apply.
* Have the k8s owner fetch credentials with `pks get-kubeconfig`.

Or in more human-friendly terms, the PKS admin creates the Kubernetes cluster, then creates roles and role bindings allowing the k8s admin to log into the cluster. Remember that the user who creates the cluster is initially _the only user_ that can auth to the k8s cluster. Remember this when assembling your workflow.

&nbsp;
&nbsp;

# Enable OIDC

This is done in Ops Manager. Navigate to the 'UAA' section and check the radio button to use UAA as the OIDC provider.

![Ops Manager]({filename}images/opsman-uaa-oidc.png)

You can keep the default values. If you know what you're doing, feel free to customize. These values will be important later, when creating the role-bindings.

Remember to "Apply Changes" to push the new configs out.

&nbsp;
&nbsp;

# Create Users

Usually done with the `uaac` cli. Create two users:

* A PKS admin, e.g. `pks-admin`
* A k8s admin, e.g. `k8s-admin`

Give the PKS admin the `pks.clusters.admin` UAA role. Do not give the k8s admin any roles. They will auth via the role bindings later.

By the way, remember the credentials. You'll need them later.

Log into PKS as the pks admin. For example:

```
pks login -u pks-admin -a pks-api.pks.domain.com
```



&nbsp;
&nbsp;

# Create a Kubernetes Cluster

After logging in as the pks admin, create a cluster. For example:

```
pks create-cluster test-cluster --external-hostname meaningful.external.hostname.com --plan dev
```

Log into the newly-created cluster. Again, as the PKS Admin.

```
pks get-credentials test-cluster
```

&nbsp;
&nbsp;

# Create the Role

Start with this:

```yml
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: developer-role
rules:
- apiGroups: ["","extensions","apps","batch"]
  resources: ["pods","deployments","namespaces","jobs","configmaps"]
  verbs: ["get","list","watch","create","update","patch","delete"]
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get","list","watch"]
```

_NOTE_: The permissions here are just to allow the k8s admin to log in. You need to modify this role to allow them to do more actions (such as view/create services, etc).

Apply the role.

```
kubectl apply -f k8s-admin-role.yml
```

&nbsp;
&nbsp;

# Create the Role-Binding

Now that the role has been created, bind that role to your k8s admin via the role binding.

```yml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: sample-developer-role-binding
subjects:
- kind: User
  name: oidc:developer-1-name # developer-1-name should exist in UAA.
  apiGroup: rbac.authorization.k8s.io
- kind: User
  name: oidc:developer-2-name # oidc: prefix is required here in the manifest and it comes from UAA section of the PKS tile
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: developer-role
  apiGroup: rbac.authorization.k8s.io
```

The values in the sample yaml file above are from the default values in Ops Manager when we enabled OIDC. Again, if you know what you're doing, feel free to customize.

Apply the role-binding.

```
kubectl apply k8s-admin-role-binding.yml
```

After applying the rol-binding, your k8s admin should now be able to log in.

&nbsp;
&nbsp;

# Kubernetes Admin Logs In

Every action we've taken (every command we've run) up to this point has been as the _PKS Admin_. We are now going to switch to being the _Kubernetes Admin_.

As the k8s admin, use the `pks` cli to auth to the PKS API and fetch a `kubeconfig` to allow us to auth to the k8s cluster and get to work.

```
pks get-kubeconfig test-cluster -a pks-api.pks.domain.com -u k8s-admin
<password prompt ensues>: *****************
```

Upon successful auth, the k8s admin should now be able to kick the tires with a `kubectl get nodes`. Remember, you need to modify the sample yml file above to allow the appropriate actions. 

&nbsp;
&nbsp;

## Profit

You now have a successful workflow for creating, and most importantly, handing off, Kubernetes clusters to your devops teams. Go make a nother cup of coffee. You still have more work to do.
 
