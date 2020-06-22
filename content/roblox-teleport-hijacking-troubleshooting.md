Title: Troubleshooting Roblox Teleport Hijacking
Date: 2020-06-22
Category: howto


# Problem

You may occasionally find that a game you made in Roblox has been hijacked and immediately teleports you to _another_ game when you start. This is a total bummer as it takes away all the time you spent creating the game and can leave you feeling helpless.

Bottom line, this is being caused by some code, somewhere, teleporting the player to the target game. This is done (currently) by a call to `Teleport()` in the API, [found here](https://developer.roblox.com/en-us/api-reference/function/TeleportService/Teleport). That means you just have to find where that call is.

Start by opening your game in Roblox Studio and read on below.

# Solution

A common vector of attack for this hijacking is putting out free models, then putting scripts in them. Another way is introducing code snippets into some boilerplate services in your game. Regardless, the fix is the same.

## Confirm Teleport Hijacking
First, confirm you're actually being teleported by opening the Output panel in Roblox Studio, running the game, and looking for the following error in the Output panel:

```text
exception while signaling: cannot teleport in the roblox studio
```

This means an attempt was made to teleport your player. Now let's find where that attempt is.

## Find Teleport Hijacking

In Roblox Studio, hit `ctrl+shift+f` to search inside _all_ code in your game. Search for 'teleport' (case-insensitive), and look through the results. There will be some noise but you're looking specifically for that call to `Teleport`. To confirm it's what you're looking for, you can cross-reference the `placeId` in your code with the place you keep getting teleported to.

Once you've found where the offending line lives, fix your problem by deleting the offending object, removing said code, whatever it takes to eliminate the problem.



Enjoy, and get back to work creating.
