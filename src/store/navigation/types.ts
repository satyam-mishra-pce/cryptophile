export type IdPath = string[];

/*
Importance of SourceID

Imagine you are at a home/wifi/satyam
In this directory, there is a password. This password is marked as favourite.
Now, if you click the password from your favourites menu...
The navigation module would navigate to the directory where the password exists, and then selects the password.
Now, you hit "back button" (i.e. pop())
Then, hit "forward button" (i.e. unpop())
You would notice that, without sourceeId, the navigation module has no information about what to select after unpop()...

Here, sourceId tells the navigation about what to select.
*/

export type NavigationPiece = {
  idPath: IdPath;
  selectedItemIds: Set<string>;
};
