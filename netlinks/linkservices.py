from google.appengine.ext import ndb
from google.appengine.api import users

import logging
import json
import datetime

from models import *




def genLinkParentKey():        #Function to create key for Link class
    user_id = users.get_current_user().user_id()
    return ndb.Key(Link, user_id)


def addLink(params):
    logging.info('addLink(): Start')
    
    link = Link(parent=genLinkParentKey()) #Create a datastore entity with parent as the key generated above
    
    #add Link details to the object
    
    link.url = params['url']
    link.parent_folder = params['parent']    
    link.name = 'Default'
    link.description = 'Default'
    link.website = 'Default'    #need to generate this field automatically from the url
    link.file_type = 'Default'
    link.date_c = datetime.datetime.now()
    link.date_m = datetime.datetime.now()
    link.path = 'Default'
    
    #save the link object
    link.put()
    
    #increment parent folder's items count and save. 
    if params['parent'] is not None:
        params['parent'].get().n_items += 1 
        params['parent'].get().put()
    
    status = 'Success: from addLink'
    return status

def updateLink(params):
    logging.info('updateLink(): start')
    
    link = params['link_key'].get()
    link.url = params['url']
    link.date_m = datetime.datetime.now()
    link.put()
    
    status = 'Success: from updateLink'    
    return status
    

def deleteLink(params):
    logging.info('deleteLink(): Start')
    
    # Decrement n_items of the parent folder and save
    params['link_key'].get().parent_folder.get().n_items -= 1
    params['link_key'].get().parent_folder.get().put()
      
    params['link_key'].delete()    
    return 'Success: from deleteLink '

    
def moveLink(params):
    logging.info('moveLink(): Start')
    
    #Decrement n_count of old parent folder
    params['link_key'].get().parent_folder.get().n_items -= 1
    params['link_key'].get().parent_folder.get().put()
    
    #Replace parent_folder of the link with dest_folder_key from the front end
    link = params['link_key'].get()
    link.parent_folder = params['target_folder_key']
    link.put()
    
    #increment n_items of new parent folder
    params['target_folder_key'].get().n_items += 1
    params['target_folder_key'].get().put()
    
    status = 'Success: From moveLink'
    return status


def copyLink(params):
    logging.info('copylink(): Start')
    
    #Get  link from GUI
    link = params['link_key'].get()
    
    #Create new link
    new_link = Link(parent=genLinkParentKey())
    
    #Copy properties of this link to new link
    new_link.name = link.name
    new_link.description = link.description
    new_link.url = link.url
    new_link.website = link.website
    #new_link.link_category = link.link_category    
    new_link.parent_folder = params['target_folder_key']    #parent should be the one provided by the user
    new_link.date_c = datetime.datetime.now()
    new_link.date_m = datetime.datetime.now()
    
    #save new link
    new_link.put()
    
    
    #logging.info('copyLink: '+params['target_folder_key'].get().name)
    #increment n_items of new parent folder
    params['target_folder_key'].get().n_items += 1
    params['target_folder_key'].get().put()
    #logging.info('copyLink: '+ str(params['target_folder_key'].get().n_items))
    
    status = 'Success: from copyLink'
    return status




def linkServices(page):
    
    logging.info('linkServices(): Start')

    action = page.request.get('action')
    params = json.loads(page.request.get('params'))
    
    if action == 'addlink':
        logging.info('linkServices: calling addLink')
        params['parent'] = ndb.Key(urlsafe=params['parent'])
        status = addLink(params)
        page.response.out.write(status)
        
    elif action == 'updatelink':
        logging.info('linkServices: calling updateLink')
        params['link_key'] = ndb.Key(urlsafe=params['link_key'])
        status = updateLink(params)
        page.response.out.write(status)
    
    elif action == 'deletelink':
        logging.info('linkServices: calling deleteLink')
        params['link_key'] = ndb.Key(urlsafe=params['link_key'])
        status = deleteLink(params)
        page.response.out.write(status)
        
    elif action == 'movelink':
        logging.info('linkServices: calling moveLink')
        params['link_key'] = ndb.Key(urlsafe=params['link_key'])
        params['target_folder_key'] = ndb.Key(urlsafe=params['target_folder_key'])
        status = moveLink(params)
        page.response.out.write(status)
        
    elif action == 'copylink':
        logging.info('linkServices: calling copyLink')
        params['link_key'] = ndb.Key(urlsafe=params['link_key'])
        params['target_folder_key'] = ndb.Key(urlsafe=params['target_folder_key'])
        status = copyLink(params)
        page.response.out.write(status)
            
    else:
        logging.info('linkServices: UNDEFINED LINK ACTION')
    
        
    