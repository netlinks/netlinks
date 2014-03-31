
from google.appengine.api import users
from google.appengine.ext import ndb

import logging

from models import User    #import User models from models.py
from folderservices import addSystemFolders
from coreservices import genUserKey


################################################### User Services ###############################################################

def addUser():
    logging.info('addUser(): Start')
    
    user = users.get_current_user() #Get current user
        
    user_key=genUserKey(user.user_id())  #create key for the user from user_id() of the user. Key is required to uniquely identify the user
        
    usr = User(key=user_key) #Create a user entity with the key generated above
    
    
    #assign form data to entity properties
    logging.info('addUser: adding user details')        
    usr.user_name = None
    usr.nick_name = user.nickname()
    usr.email = user.email()
    usr.address = None
    usr.phone = None
    
    #Create system folders and store keys of system folders
    logging.info('addUser: adding system folders')   
    sys_folder_keys = addSystemFolders() 
    
    logging.info('addUser: storing system folder keys in user object')   
    usr.sysfolder_root = sys_folder_keys['root']
    usr.sysfolder_mydrive = sys_folder_keys['mydrive']
    usr.sysfolder_videos = sys_folder_keys['videos']
    usr.sysfolder_articles = sys_folder_keys['articles']
    usr.sysfolder_images = sys_folder_keys['images']
    usr.sysfolder_apps = sys_folder_keys['apps']
        
    usr.put()    #save details to datastore
    
    status = 'success'
    
    return status
         
def updateUser():
    pass

def deleteUser():
    pass

    
############################################ End of User Services #####################################################