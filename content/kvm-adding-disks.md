Title: Adding Virtual Disks in KVM
Date: 2018-07-03
Category: howto

###_If you want to be useful, learn a trade_


```
#!/bin/bash

for vm in `virsh list --name | grep hdf`; do
    for disk in b c d; do
	disk_name=${vm}-vd${disk}.qcow2
        qemu-img create -f qcow2 ~/os-images/${vm}/${disk_name} 10G
	virsh attach-disk ${vm} ~/os-images/${vm}/${disk_name} vd${disk} \
	--cache none \
        --driver qemu \
        --subdriver qcow2 \
        --targetbus virtio \
        --persistent
    done
done
```
