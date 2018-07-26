Title: Adding Virtual Disks in KVM
Date: 2018-07-03
Category: howto

Sometimes you need to make a few VMs. For me, it's usually libvirt.

We have some scripting around the creation of a number of machines, but what we don't have (yet) is the ability to add additional disks to those VMs. So instead of chasing each machine in the VM Manager UI, let's slap together some bash (remember Bash? Remember [the previous entry?]({filename}fundamentals.md)).


```bash
#!/bin/bash

# Create, and attach, three additional disks:
# /dev/vdb
# /dev/vdc
# /dev/vdd
for vm in `virsh list --name`; do
    for disk in b c d; do

        # Fancy disk name
        disk_name=${vm}-vd${disk}.qcow2

        # Create the disk.
        qemu-img create -f qcow2 ~/os-images/${vm}/${disk_name} 10G

        # Attach it
        virsh attach-disk ${vm} ~/os-images/${vm}/${disk_name} vd${disk} \
        --cache none \
        --driver qemu \
        --subdriver qcow2 \
        --targetbus virtio \
        --persistent
    done
done
```
