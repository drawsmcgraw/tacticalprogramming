Title: Pivotal Cloud Foundry and VM Extensions in AWS
Date: 2019-05-07
Category: howto

# Problem
As of this writing, the docs for [deploying PCF on Amazon using Terraform](https://docs.pivotal.io/pivotalcf/2-5/customizing/aws-terraform.html) have a gap that could lead to a lot of frustration. In short, the Terraform files and docs have switched to using Network Load Balancers instead of 'Classic', Elastic Load Balancers. Modernizing is fine, but it's left out a detail that we need to implement ourselves.

The problem is that our router vms need to be placed behind the `vms_security_group` in order to accept HTTP/HTTPS traffic. But how do we tell PCF (and therefore, Bosh) to make that association? We do it with the `vm_extension` feature.

# TL;DR
You need to create three vm extensions and add them under the `resource-config` section for the `compute`, `router`, and `tcp_router` jobs in your product config (i.e. PAS or PKS).

For reference, see the engineering team's pipeline. Specifically [this shell script which makes the vm extensions](https://github.com/pivotal-cf/terraforming-aws/blob/d4482bb733e34a7e3c4a48ef55f65610a91a57eb/ci/tasks/custom-vm-extensions.sh#L10) and [this sample PAS config template](https://github.com/pivotal-cf/terraforming-aws/blob/d4482bb733e34a7e3c4a48ef55f65610a91a57eb/ci/assets/template/srt-config.yml#L57)

# Solution, Detailed
Follow the docs as usual to configure your product. But before deploying, SSH into your Ops Manager vm. You'll also need the [`om`](https://github.com/pivotal-cf/om) utility.

## Create the VM Extensions
Set up `om` to auth to your Ops Manager:

```
export OM_USERNAME=admin
export OM_PASSWORD='password'
export OM_TARGET=https://localhost
```

Use `om` to create your three vm extensions. You can safely copy/paste the following code block.
```
om -k curl --path /api/v0/staged/vm_extensions/web-lb-security-groups -x PUT -d \
  '{"name": "web-lb-security-groups", "cloud_properties": { "security_groups": ["web_lb_security_group", "vms_security_group"] }}'

om -k curl --path /api/v0/staged/vm_extensions/ssh-lb-security-groups -x PUT -d \
  '{"name": "ssh-lb-security-groups", "cloud_properties": { "security_groups": ["ssh_lb_security_group", "vms_security_group"] }}'

om -k curl --path /api/v0/staged/vm_extensions/tcp-lb-security-groups -x PUT -d \
  '{"name": "tcp-lb-security-groups", "cloud_properties": { "security_groups": ["tcp_lb_security_group", "vms_security_group"] }}'
```

Onward to the config.

## Fetch the existing config
Inspect your staged products (this is where you'll look for PAS or PKS):

```
om -k staged-products
+--------+-----------------+
|  NAME  |     VERSION     |
+--------+-----------------+
| p-bosh | 2.5.2-build.172 |
| cf     | 2.5.2           |
+--------+-----------------+
```

In my case, I'm deploying PAS, so I care about the `cf` entry. Let's grab the current config:

```
om -k staged-config --product-name cf > srt-config.yml
```

## Update the config
You'll need to update three things:

1) Update the `resource-config` portion to include the vm extensions you created. As an example, here's the stanza for the `router` section. Note the `additional_vm_extensions` addition.
```
  router:
    instances: automatic
    instance_type:
      id: automatic
    internet_connected: false
    elb_names:
    - alb:pcf-web-tg-80
    - alb:pcf-web-tg-443
    additional_vm_extensions:
    - web-lb-security-groups
```

Do that for the `compute` and `tcp-router` sections as well. Be sure to put in the _correct_ load balancer names (be wary of copy/paste errors).

2) Re-enter the CredHub key in the `credhub_key_encryption_passwords` section. Because reasons, some sensitive information doesn't survive the export. You need to put it back into the config file.

3) Re-enter the SSL cert/key in the `networking_poe_ssl_certs` section for the same reasons.

For reference, here's a diff of what the changes looked on my system after I was done updating them.

```
--- srt-config.yml	2019-05-07 14:57:46.254487693 +0000
+++ srt-config.yml.updated.yml	2019-05-07 15:16:08.187072002 +0000
@@ -109,8 +109,10 @@
     selected_option: internal_mysql
     value: internal_mysql
   .properties.credhub_key_encryption_passwords:
-    value:
-    - name: key
+    value: 
+    - key: 
+        secret: randomstringthatisatleasttwentydigits
+      name: key
       primary: true
       provider: internal
   .properties.diego_database_max_open_connections:
@@ -160,7 +162,61 @@
     value: connect,query
   .properties.networking_poe_ssl_certs:
     value:
-    - name: pcf
+    - certificate:
+        cert_pem: |
+          -----BEGIN CERTIFICATE-----
+          CERT STUFFS
+          -----END CERTIFICATE-----
+        private_key_pem: |
+          -----BEGIN RSA PRIVATE KEY-----
+          KEY STUFFS
+          -----END RSA PRIVATE KEY-----
+      name: pcf
   .properties.networkpolicyserver_database_max_open_connections:
     value: 200
   .properties.networkpolicyserverinternal_database_max_open_connections:
@@ -338,6 +394,8 @@
     internet_connected: false
     elb_names:
     - alb:pcf-ssh-tg
+    additional_vm_extensions:
+    - ssh-lb-security-groups
   database:
     instances: automatic
     persistent_disk:
@@ -378,6 +436,8 @@
     elb_names:
     - alb:pcf-web-tg-80
     - alb:pcf-web-tg-443
+    additional_vm_extensions:
+    - web-lb-security-groups
   tcp_router:
     instances: automatic
     persistent_disk:
@@ -396,6 +456,8 @@
     - alb:pcf-tg-1031
     - alb:pcf-tg-1032
     - alb:pcf-tg-1033
+    additional_vm_extensions:
+    - tcp-lb-security-groups
 errand-config:
   deploy-autoscaler:
     post-deploy-state: true
```

As a reminder, you can use the templated PAS config (linked above) as a reference when you update your config.


## Upload the Config
Here's what a successful update looks like:

```
./om -k configure-product -c srt-config.yml.updated.yml 
configuring product...
setting up network
finished setting up network
setting properties
finished setting properties
applying resource configuration for the following jobs:
	backup_restore
	blobstore
	compute
	control
	database
	ha_proxy
	istio_control
	istio_router
	mysql_monitor
	route_syncer
	router
	tcp_router
applying errand configuration for the following errands:
	deploy-autoscaler
	deploy-notifications
	deploy-notifications-ui
	metric_registrar_smoke_test
	nfsbrokerpush
	push-apps-manager
	push-usage-service
	smbbrokerpush
	smoke_tests
	test-autoscaling
finished configuring product
```

The system will tell you if there are errors in your configuration. Consider a successful upload to be a valid config.

Except...

## Enter the CredHub Key One More Time
For reasons I don't understand yet, the product deployment will fail because the credhub key gets mangled somehow. The error I saw was `Details: undefined method 'length' for 1.2345678910111213e+30:Float`.

To fix this, re-enter the key in the Ops Manager UI.

You may now continue with your deployment as normal. When your vms get created, the router vms will be placed behind the `vms_security_group`, which allows your HTTP/HTTPS traffic through.

## Last Thoughts
This really is the ugly, mnaual way of doing it. A more 'correct' way of doing this would be using the Ops Manager api to update the job config for your product to include the vm extensions. That journey begins with [the API docs for managing vm extensions](https://docs.pivotal.io/pivotalcf/2-5/opsman-api/?shell#configuring-resources-for-a-job-experimental). 

You would still be using `om` to create the vm extensions, but you wouldn't have to pull down, update, and push back the product configuration. My hope is to come up with that cleaner method and follow up on that topic here. Eventually.

For now, consider yourself unstuck, even if it's a little ugly.

