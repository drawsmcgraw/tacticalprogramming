Title: Mounted a LUKS-encrypted drive
Date: 2018-07-03
Category: howto

###_If you want to be useful, learn a trade_

```
# Decrypt
sudo cryptsetup luksOpen /dev/sdb3 my_encrypted_volume

# Optional
sudo vgimportclone /dev/mapper/my_encrypted_volume

# Mount
sudo mount /dev/ubuntu-vg1/root /media/my_device/


```
