Title: Troubleshooting Battery Drain Issues on the Garmin Venu 3
Date: 2025-01-07
Category: howto

## Problem
Garmin Venu 3 watches will sometimes go into severe battery drain mode, measured by more than 1% per hour (normaly, a single charge will last over ten days). This is further complicated by the sheer opacity of the devices. There's no logs, no error indicators, and the only way to interact with the device is a desktop program.

## Solution (sort of)
The Internet is filled with threads and forum posts of people performing various Kabuki dances because knowing the cause is impossible, so you can't execute a precise fix.

I'd like to add to that pile.

For me, the behavior seems to happen after a software update on the watch. My hypothesis is that something goes wrong during the device update - corrupt file, unmoved data, something. This causes the watch to enter into an infinite loop, burning up the battery. So the theory is that if you delete some of these files, it will remove the logjam, and put the watch back into a good known state.

Connect the watch to your computer, then navigate to the `GARMIN`, directory. In there are two directories:

* `NewFiles`
* `RemoteSW`

You may find some `.FIT` files in the first directory and some zipped files named suspiciously like update files in the second. Delete them. 

With the watch still connected to the computer, power cycle the watch (I hold the top button for 5-10 seconds). Once it's powered back on, disconnect the watch. Then (yes) reconnect the watch. Observe the two directories again and confirm that they are both empty. Disconnect the watch, test, and observe overnight to see if this fixed the problem.

## Recap

So that's:

* Connect the watch to the computer.
* Delete files in the `NewFiles` and `RemoteSW` directories.
* Power cycle
* Disconnect the watch
* Reconnect the watch
* Confirm the two directories are empty

Addendum, you may need to 'sync' and/or apply updates during this process. Your mileage may vary.

Now get back out there and [get back to it](https://arnoldspumpclub.com).
