
from google.appengine.ext import ndb
from google.appengine.api import users

import logging
import json
import datetime

from models import Folder, Link
from coreservices import genFolderParentKey, genLinkParentKey

###########################   Folder Services   ###############################

# seperate function for adding root folder is created to make logic simple. Otherwise there will be complications to take care when parent is null and path is /
def addRootFolder():
    logging.info('addRootFolder(): Start')
    
    folder = Folder(parent=genFolderParentKey()) #Create a datastore entity with parent as the key generated above
    
    #No need of param checks as the call is guaranteed to be internal.
    folder.name = "root"
    folder.icon = None
    folder.color = None
    folder.date_c = datetime.datetime.now()
    folder.date_m = datetime.datetime.now()
    folder.n_items = 0         #this value needs to be calculated and populated.
    folder.view = None
    folder.path = '/'
    folder.parent_folder = None
    
    return folder.put()


def addFolder(params):
    logging.info('addFolder(): Start')
        
    folder = Folder(parent=genFolderParentKey()) #Create a datastore entity with parent as the key generated above
        
    #assign form data to entity properties
    if 'name' in params:           
        folder.name = params['name']
    else:
        folder.name = 'Folder'
    
    if 'icon' in params:
        folder.icon = params['icon']
    else:
        folder.icon = 'Default'
    
    if 'color' in params:
        folder.color = params['color']
    else:
        folder.color = 'Default'
    
    folder.date_c = datetime.datetime.now()
    folder.date_m = datetime.datetime.now()
    folder.n_items = 0         #this value needs to be calculated and populated.
    
    if 'view' in params:
        folder.view = params['view']
    else:
        folder.view = 'Default'
    
    if 'parent_folder_key' in params:
        folder.parent_folder = params['parent_folder_key']
        folder.path = params['parent_folder_key'].get().path + folder.name + '/'    #calculate path from parent folder and save - parent folder path + my name
        
        #increment parent folder's items count and save. Do it only  if current folder is not root,
        params['parent_folder_key'].get().n_items += 1 
        params['parent_folder_key'].get().put()
        
    else:                                                       #if no parent folder mentioned, set parent as mydrive        
        #folder.parent_folder = usr.sysfolder_mydrive            #TODO need to set parent as 'mydrive' 
        #folder.path = params['parent_folder_key'].get().path + folder.name + '/'    #calculate path from parent folder and save - parent folder path + my name
        
        ###### Add folder always have to have a parent. Otherwise it will not be added
        return
        
    return folder.put()     #save the folder details and return the key
    
        
     
    
##################################################################################################################    

def updateFolder(params):
    logging.info('updateFolder(): start')
    
    if 'folder_key' in params:
        folder = params['folder_key'].get()
    else:
        return False
    
    change = False
    
    if 'new_name' in params:
        folder.name = params['new_name']
        
        #calculate updated path and save - parent folder path + my name
        folder.path = folder.parent_folder.get().path + folder.name + '/'
        
        #TODO - Need to update path of all subfolder. it looks need a seperate folder to calculate the path of folders

        change = True
    
    #TODO need to capture changes in other parameters of the link
    
    if change is True:
        folder.date_m = datetime.datetime.now()
        folder.put()
        status = 'Success: from updateFolder'
    else:
        status = "No changes"
    
    return status
    
##################################################################################################################

def deleteFolder(params):
    logging.info('deleteFolder(): Start')
    
    #capture parent folder. This is to decrement n_items. It is better to decrement it after delete operation
    parent = params['folder_key'].get().parent_folder.get()
    
    
    #delete subfolders
    deleteAllSubFolders(params['folder_key'].get())    
   
    # Decrement n_items of the parent folder and save. 
    parent.n_items -= 1
    parent.put()
   
    status = 'Success: from deleteFolder'
    
    return status

def deleteAllSubFolders(folder):
    logging.info("deleteAllSubFolder() : start")
        
    logging.info(folder.name)
    
    #get subfolders
    subfolders = Folder.query(Folder.parent_folder==folder.key).fetch();
    
    #delete all sub folders
    for subfolder in subfolders:
        deleteAllSubFolders(subfolder)
    
    #find and delete the links in this folder
    subLinks = Link.query(Link.parent_folder==folder.key).fetch();
    for subLink in subLinks:
        logging.info("deleting Link: " + subLink.name)
        subLink.key.delete()
        
    logging.info("deleting Folder: " + folder.name)
    folder.key.delete()
    
    return 'Success'


##################################################################################################################

def moveFolder(params):
    logging.info('moveFolder(): start')
    
    
    #Decrement n_items of the current parent folder and save
    logging.info('moveFolder: decrementing content count of :'+ params['folder_key'].get().parent_folder.get().name)
    params['folder_key'].get().parent_folder.get().n_items -= 1
    params['folder_key'].get().parent_folder.get().put()
    
    
    
    #Save the new parent folder details
    #==================================
    folder = params['folder_key'].get()
    folder.parent_folder = params['target_folder_key']
    
    #calculate path from parent folder and save - target folder path + my name
    folder.path = params['target_folder_key'].get().path + folder.name + '/'
    
    #save to datastore
    folder.put()    
    
    #===================================
    
      
      
    #Increment n_items of the new parent folder and save
    logging.info('moveFolder: incrementing content count of :'+ params['target_folder_key'].get().name)
    
    params['target_folder_key'].get().n_items += 1
    params['target_folder_key'].get().put()
    
    status = 'Success: from movefolder'
    
    return status


        

##################################################################################################################


def copyFolder(params):
    
    #TODO Need to copy subfolders tree contents
    
    logging.info('copyFolder(): Start')
    
    #Get current folder from GUI
    folder = params['folder_key'].get()
    target_folder = params['target_folder_key'].get()
    
    copyAllSubFolders(folder, target_folder)
        
    #increment n_items of new parent folder and save it
    target_folder.n_items += 1
    target_folder.put()
    #logging.info('copyLink: '+ str(params['target_folder_key'].get().n_items))
    
    status = 'Success: from copyfolder'
    
    return status    
    
#TODO Copy the subfolders and files

def copyAllSubFolders(folder, target_folder):
    #TODO Need to copy subfolders tree contents
    
    logging.info('copyAllSubFolder(): Start')
    
    #Create new folder element to copy the folder
    new_folder = Folder(parent=genFolderParentKey())
    
    #Copy the folder to new folder 
    logging.info('copyAllSubFolders: copying folder |'+folder.name+'| to: |'+target_folder.name) 
    new_folder.populate(**folder.to_dict())     #to_dict returns the dictionary of 'folder' and '.populate()' will save the value pairs to new folder
    
    #change necessary parameters
    new_folder.parent_folder = target_folder.key    #parent of new folder should be the target folder
    new_folder.date_c = datetime.datetime.now()
    new_folder.date_m = datetime.datetime.now()
    new_folder.path = target_folder.path + new_folder.name + '/'   #path is calcuated from the give target folder's path
    
    #save new folder
    new_folder.put()
    
     
    
    #find and copy files in this folder
    subLinks = Link.query(Link.parent_folder==folder.key).fetch();
    for subLink in subLinks:
        logging.info("deleting Link: " + subLink.name)
        
        #Create new link
        new_link = Link(parent=genLinkParentKey())
        
        #Copy the links to new folder 
        logging.info('copyAllSubFolders: copying file |'+subLink.name+'| to: |'+target_folder.name) 
        new_link.populate(**subLink.to_dict())     #to_dict returns the dictionary of 'subLink' and '.populate()' will save the value pairs to new link
        
        new_link.parent_folder = new_folder.key    #parent of new folder should be the one provided by the user
        new_link.date_c = datetime.datetime.now()
        new_link.date_m = datetime.datetime.now()
        new_link.path = new_folder.path
        
        #save new link
        new_link.put()
    
    #find and copy the subfolders in this folder
    subfolders = Folder.query(Folder.parent_folder==folder.key).fetch();
    for subfolder in subfolders:
        copyAllSubFolders(subfolder, new_folder)
        
    return "success"    

#################################################################################################################

def getFolderContents(params):
    logging.info('getFolderContents(): Start')
         
    #temporary class to save folder details temporarily before saving it in to folder dictionary. 
    class linkclass: 
        pass
    
    #temporary class to save folder details temporarily before saving it in to folder dictionary. 
    class folderclass: 
        pass
    
    #declare dictionary to store retrieved folders and links. dictionaries needs to be declared before using it
    folder_contents_dict = {'folder':[], 'link':[]}
    
    
    #get links in this folder
    #create query to find links with filter parent_folder = (params["folder_key"]) - folder key retrieved from the GUI interface
    links = Link.query(Link.parent_folder==params['folder_key']).fetch()
    
    #iterate through links retrieved by above query
    for link in links:
        link_temp = linkclass()
        
        
        link_temp.name = link.name
        link_temp.description = link.description
        link_temp.url = link.url
        link_temp.website = link.website
        link_temp.key = link.key.urlsafe()
        link_temp.file_type = link.file_type
        link_temp.date_c = link.date_c.isoformat()
        link_temp.date_m = link.date_m.isoformat()
        link_temp.path = link.path
        
        folder_contents_dict['link'].append(link_temp.__dict__)
    
    
    
    #get subfolders in this folder
    #create query to find folders with filter parent_folder = (params["folder_key"]) - folder key retrieved  from the GUI interface
    subfolders = Folder.query(Folder.parent_folder==params['folder_key']).fetch()
       
    #iterate through folder contents retrieved by above query           
    for folder in subfolders:
        folder_temp = folderclass()    #create instance of folderclass to temporarily store folder details before writing to dictionary.
        
        #assign folder details of datastore to temporary folder class
        folder_temp.key = folder.key.urlsafe()
        folder_temp.name = folder.name
        folder_temp.date_c = folder.date_c.isoformat()   #isoformat() is to convert the python date format to json serializable format
        folder_temp.date_m = folder.date_m.isoformat()   #isoformat() is to convert the python date format to json serializable format
        folder_temp.n_items = folder.n_items
        folder_temp.path = folder.path
        folder_temp.icon = folder.icon
        folder_temp.color = folder.color
        folder_temp.view = folder.view
        folder_temp.parent_folder = folder.parent_folder.urlsafe()
        
        #append this folder details to the dictionary. ___dict__ will return the dictionary format of the object
        folder_contents_dict['folder'].append(folder_temp.__dict__)        
     
    #construct current folder's details as well to send back. This might be required by GUI for various purpose. 
    
    current_folder = params['folder_key'].get() #get current folder object
    
    current_folder_temp = folderclass()  #temporary folder object
    
    current_folder_temp.key = current_folder.key.urlsafe()
    current_folder_temp.name = current_folder.name
    current_folder_temp.date_c = current_folder.date_c.isoformat()   #isoformat() is to convert the python date format to json serializable format
    current_folder_temp.date_m = current_folder.date_m.isoformat()   #isoformat() is to convert the python date format to json serializable format
    current_folder_temp.n_items = current_folder.n_items
    current_folder_temp.path = current_folder.path
    current_folder_temp.icon = current_folder.icon
    current_folder_temp.color = current_folder.color
    current_folder_temp.view = current_folder.view
    current_folder_temp.parent_folder = current_folder.parent_folder.urlsafe()


    #add current folder details to the dictionary
    folder_contents_dict['current_folder'] = current_folder_temp.__dict__
    
    #convert python dictionary in to json format
    folder_contents_json = json.dumps(folder_contents_dict)
    
    #return json object
    return folder_contents_json
        
   
##################################################################################################################


def addSystemFolders():
    logging.info('addSystemFolders(): Start')
    

    # add root folder and capture they key
    root_key = addRootFolder()  
    
    #set parameters for other system folder. set parent as root key
    mydrive = {
        'name' : 'mydrive',
        'icon' : 'mydrive_icon',
        'color' : 'mydrive_color',
        'view' : 'grid',
        'parent_folder_key' : root_key
    }
    
    videos = {
        'name' : 'videos',
        'icon' : 'videos_icon',
        'color' : 'videos_color',
        'view' : 'grid',
        'parent_folder_key' : root_key
        
    }
    
    articles = {
        'name' : 'articles',
        'icon' : 'articles_icon',
        'color' : 'articles_color',
        'view' : 'grid',
        'parent_folder_key' : root_key 
    }
    
    images = {
        'name' : 'images',
        'icon' : 'images_icon',
        'color' : 'images_color',
        'view' : 'grid',
        'parent_folder_key' : root_key
    }

    apps = {
        'name' : 'apps',
        'icon' : 'apps_icon',
        'color' : 'apps_color',
        'view' : 'grid',
        'parent_folder_key' : root_key
              
    }
    
    #create the folder and capture the keys to return
    sys_folder_keys = {
        'root' : root_key,
        'mydrive' : addFolder(mydrive),
        'videos' : addFolder(videos),
        'articles' : addFolder(articles),
        'images' : addFolder(images),
        'apps' : addFolder(apps)
    }
    
    #return the keys to link it to the user
    return sys_folder_keys
    
##################################################################################################################    
    

def folderServices(page):
    logging.info('folderServices(): Start')

    action = page.request.get('action')                 #Capture the action from front end
    params = json.loads(page.request.get('params'))     #Parse the JSON object from the front end
    
    
    if action == 'addfolder':
        logging.info('folderServices: adding folder')
        #convert the key to datastore key object before passing
        params['parent_folder_key'] = ndb.Key(urlsafe=params['parent_folder_key']) 
        addFolder(params)
        status = 'success addfolder'
        page.response.out.write(status)
        
        
    elif action == 'updatefolder':
        logging.info('folderServices: updating folder')
        #convert the key to datastore key object before passing
        params['folder_key'] = ndb.Key(urlsafe=params['folder_key'])
        status = updateFolder(params)
        page.response.out.write(status)
        
    elif action == 'deletefolder':
        logging.info('folderServices: deleting folder')
        #convert the key to datastore key object before passing
        params['folder_key'] = ndb.Key(urlsafe=params['folder_key'])
        status = deleteFolder(params)
        page.response.out.write(status)
        
    elif action == 'viewfolder':
        logging.info('folderServices: retrieving folder contents')
        #convert the key to datastore key object before passing
        params['folder_key'] = ndb.Key(urlsafe=params['folder_key']) 
        folder_contents = getFolderContents(params)
        page.response.out.write(folder_contents)
        
    elif action == 'movefolder':
        logging.info('folderServices: moving folder')
        #convert the keys to datastore key object before passing
        params['folder_key'] = ndb.Key(urlsafe=params['folder_key'])
        params['target_folder_key'] = ndb.Key(urlsafe=params['target_folder_key'])
        status = moveFolder(params)
        page.response.out.write(status)
        
    elif action == 'copyfolder':
        logging.info('folderServices: copying folder')
        #convert the keys to datastore key object before passing
        params['folder_key'] = ndb.Key(urlsafe=params['folder_key'])
        params['target_folder_key'] = ndb.Key(urlsafe=params['target_folder_key'])
        status = copyFolder(params)
        page.response.out.write(status)
        
        
    else:
        logging.info('folderservices: UNDEFINED FOLDER ACTION')
    
    
        





########################## End of folder services  ############################