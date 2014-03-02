
from google.appengine.api import users
from google.appengine.ext import ndb

from models import User    #import all datastore models from models.py
from folderservices import *


################################################### User Services ###############################################################

#Function to generate key for user class
def genUserKey(user_id):        
    return ndb.Key(User, user_id)

def isUserSignedUp(user_id):        #Function to check if user is already signed up
    user_key=genUserKey(user_id)  #create key for the user from user_id of the user
    
    if  user_key.get():  #if user does not exists in database return false;
        return False
    
    else:     #if user exists in database, return true
        return True

#generic utility to get user object from user id
def getUser(user_id):
    user_key=genUserKey(user_id)  #create key for the user from user_id of the user
    return user_key.get()   #return the user object


def addUser(page):
    logging.info('addUser(): Start')
    
    user = users.get_current_user() #Get current user
        
    user_key=genUserKey(user.user_id())  #create key for the user from user_id() of the user. Key is required to uniquely identify the user
        
    usr = User(key=user_key) #Create a user entity with the key generated above
    
    
    #assign form data to entity properties
    logging.info('addUser: adding user details')        
    usr.user_name = page.request.get('user_name')
    usr.nick_name = page.request.get('nick_name')
    usr.email = page.request.get('email')
    usr.address = page.request.get('address')
    usr.phone = page.request.get('phone')
    
    #Create system folders and store keys of system folders
    logging.info('addUser: adding system folders')   
    sys_folder_keys = addSystemFolders() 
    
    logging.info('addUser: storing system folder')   
    usr.sysfolder_root = sys_folder_keys['root']
    usr.sysfolder_mydrive = sys_folder_keys['mydrive']
    usr.sysfolder_videos = sys_folder_keys['videos']
    usr.sysfolder_articles = sys_folder_keys['articles']
    usr.sysfolder_images = sys_folder_keys['images']
    usr.sysfolder_apps = sys_folder_keys['apps']
        
    usr.put()    #save details to datastore
    
    status = 'success'
    
    page.response.out.write(status)
         
def updateUser():
    pass

def deleteUser():
    pass

    
############################################ End of User Services #####################################################