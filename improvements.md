# Rework

Let's rethink the relationship of the content and the users. 
First, let's create admin console, in the admin console there are certain actions for syncing possible.

1. Sync content - will sync all the content we have for lessons and dictionary to the database. (no input)
2. Delete user - will delete all data for a user (input: string, of email)
3. Clear progress - will delete all the progress for a user (input: string, of email)

The only admin will be liu00david@gmail.com, hardcode this.

Then, let's rework the dictionary page logic.

1. Users will have two tabs, LEARNED words or ALL words.
2. When uses take lessons, the current lesson's words will be added to the dictionary's "LEARNED words".
3. For example, if the user is new, the dictionary in LEARNED words will only consist of that lesson.
4. There will be no option to 'sync dictionary from lessons', this will be done by admin.

Then let's rework the training and quiz logic.

1. The quiz will have two tabs, the first one only consist of questions from the LEARNED words, and the second is for ALL words.
2. If the number of LEARNED words is greater than the quiz length (5, 10, 20), then simply repeat questions.
3. Do the same for training.

Then lastly, we will develop more lessons (to do in the next iteration of work).


Provide any queries to execute for the database to make these changes, and ask me to do whatever is necessary. 