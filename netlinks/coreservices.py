
from google.appengine.ext import ndb
from google.appengine.api import users


from models import Link, Folder, User


###########################   Core Folder Services   ###############################

def genFolderParentKey():        #Function to create key for user class
    user_id = users.get_current_user().user_id()
    return ndb.Key(Folder, user_id)



###########################   Core Link Services   ###############################

def genLinkParentKey():        #Function to create key for Link class
    user_id = users.get_current_user().user_id()
    return ndb.Key(Link, user_id)




############################ Core User Services
#Function to generate key for user class
def genUserKey(user_id):        
    return ndb.Key(User, user_id)

#Function to check if user is already signed up
def isUserSignedUp():        
    user_id = users.get_current_user().user_id()
    user_key = genUserKey(user_id)  #create key for the user from user_id of the user
    
    if  user_key.get():             #if user exists in database, return true
        return True
    else:                           #if user does not exists in database return false;
        return False


#generic utility to check if user is signed in or not
def isUserSignedIn():
    user = users.get_current_user()        #Check if user is already signed
        
    if user:                         #If user is not signed in dont do anything
        return True
    else:
        return False        

#generic utility to get user object from user id
def getUser(user_id):
    user_key = genUserKey(user_id)  #create key for the user from user_id of the user
    return user_key.get()   #return the user object

#utility to get current logged in user
def getCurrentUser():
    user_id = users.get_current_user().user_id()
    user_key = genUserKey(user_id)  #create key for the user from user_id of the user
    user = user_key.get()
    return user   #return the user object