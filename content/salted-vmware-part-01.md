Title: Saltstack and VMWare - Deploying VMs from Templates
Date: 2018-09-19
Category: howto

It turns out that there are a lot of nuances when using Saltstack with VMWare. Let's walk through the requirements for successfully using Saltstack to deploy VMs on VMWare. 

# Assumptions
To narrow the scope of this post, we'll assume the following is already taken care of.

* The intended use is to deploy VMs from a template, a la a normal cloud provider.
* You already have a healthy VMWare environment.
* Permissions - There are many and I won't pretend to know all of them. However, [this VMWare KB article](https://kb.vmware.com/s/article/1020934) is a good place to start.
* You already have a Salt master with the appropriate packages installed. See [the Saltstack docs on VMWare](https://docs.saltstack.com/en/latest/topics/cloud/vmware.html).
* You are already familiar with Salt Cloud concepts, such as providers and profiles. If not, give the [Salt Cloud Quickstart](https://docs.saltstack.com/en/latest/topics/cloud/qs.html#salt-cloud-qs) a read.


# Creating a Template

A template is nothing more than a VM that you've prepared, then cloned into a 'template' in VMWare. To shorten this entire process, here's the naive Bash script I came up with for preparing a CentOS 7 template.

```bash
# Disable ipv6
echo "net.ipv6.conf.all.disable_ipv6 = 1"     >> /etc/sysctl.conf
echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.conf
  
# Disable firewalld. We'll configure our own firewall, thanks.
systemctl stop firewalld
systemctl disable firewalld
  
# Install SSH key
mkdir -p /home/centos/.ssh
echo "<contents of public ssh key>" >> /home/centos/.ssh/authorized_keys
chmod 700 /home/centos/.ssh
chmod 600 /home/centos/.ssh/authorized_keys
chown -R centos:centos /home/centos/.ssh
  
# Set password for centos user
echo 'centos:<password hash>' | chpasswd -e
  
# Disable root SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
  
# Configure DNS
cat << EOF > /etc/resolv.conf
nameserver <DNS Server>
nameserver <DNS Server>
EOF
  
# Enable sudo for centos
echo "centos ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/centos
 
# Install VMWare Tools and deps (and Vim because, well, Vim).
yum install -y open-vm-tools \
               perl \
               vim
  
# Update system
yum clean all
yum update -y
```

**NOTE**: You must still separately install Perl in order for `open-vm-tools` (nee VMWare Tools) to work. Otherwise, guest OS customization will fail with archaic, difficult to interpret errors. Perl is required but is not listed as a dependency. This is a known bug ([Github issue](https://github.com/vmware/open-vm-tools/issues/56) & [Bugzilla page](https://bugzilla.redhat.com/show_bug.cgi?id=1358108)). Until this problem is fixed, just install Perl.


# Creating a VMWare Provider

We will keep our provider as simple as possible - just enough details to connect to the Vcenter server.

```yaml
vmware:
  driver: vmware
  user: 'username'
  password: 'password'
  url: 'vcenter-hostname.company.com'
```

# Creating a VMWare Profile

I like to create a boilerplate profile, then 'extend' that profile to reduce the overhead of maintining profiles.

```yaml
#
# Base Profile.
# Do not specify this profile when creating VMs.
# Instead, extend it via the 'extends' parameter.
#
vmware-template:
  deploy: True
  provider: vmware
  clonefrom: "base-centos-7-template"
  datacenter: datacenter
  folder: dev-team
  cluster: some-cluster

  ## Optional arguments
  num_cpus: 2
  memory: 2GB
  
  devices:
    network:
      'Network adapter 1':

        name: 'network-name'

        # switch_type can be either 'standard' or 'distributed'
        switch_type: distributed 

        # When using a distributed network, you'll need the virtual switch name as well
        dvs_switch: 'dvs-name'

        adapter_type: vmxnet3    
        gateway: ['192.168.1.1']
        subnet_mask: 255.255.255.0

  domain: dev.company.com
  dns_servers:
    - 192.168.1.200
    - 192.168.1.201

  # To ssh into the machine for Salt bootstrapping
  ssh_username: centos
  private_key: /etc/salt/salt.pem


  # Minion configuration
  minion:
    master: 192.168.1.2

    # Report IP addresses back to the Salt Mine
    mine_functions:
      network.ip_addrs: []

    # Force a mine.update when the minion comes alive.
    # Note - this will run each time the minion starts/restarts.
    startup_states: sls
    sls_list:
      - mine.update_mine

#
# Salt Master Configuration
#
salt-master:
  deploy: False
  extends: vmware-template

  num_cpus: 4
  memory: 4GB
  
  devices:
    network:
      'Network adapter 1':
        ip: 192.168.1.100

#
# Elasticsearch Data Node
#
es-data-node:
  extends: vmware-template

  num_cpus: 8
  memory: 32GB
  
  devices:
    network:
      'Network adapter 1':
        ip: 192.168.1.101

```

*Note* - The network adapter under the `network` key (in this example, `Network adapter 1`) is the name of the network adapter _according to VMWare_. This is *not* `eth0` or `ens192` or what the operating system wants to call it. Remember that detail when writing your profile.

# Creating Map Files

And of course, no Salt Cloud writeup is complete without map files. Here's one to deploy several Elasticsearch nodes.

```yaml
es-data-node:
  esdata-01:
    devices:
      network:
        'Network adapter 1':
          ip: 192.168.1.210
  esdata-02:
    devices:
      network:
        'Network adapter 1':
          ip: 192.168.1.211
  esdata-03:
    devices:
      network:
        'Network adapter 1':
          ip: 192.168.1.212
```

# Creation

With the above configurations in place, you should successfully be able to create VMs at-will.

```bash
# Create a single VM
salt-cloud -p es-data-node my-little-data-node-01

# Use a map file
salt-cloud -P -m /etc/salt/cloud.maps.d/vmware-maps.conf
```

That is all! Share and enjoy.
