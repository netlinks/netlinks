import logging
import json


from coreservices import getCurrentUser
from folderservices import addFolder
from linkservices import addLink


################################################################################################################


def saveBookmarks(node, parent):
    
    if 'children' in node:
        #this is a folder
        logging.info('saving Folder ++++> ' + node['title'])
        
        
        #create folder params from the current node
        folder_params  =    {   'name'              : node['title'], 
                                'parent_folder_key' : parent
                            }
        
        #add a folder and capture the key
        key = addFolder(folder_params)
        
        for child in node['children']:
            saveBookmarks(child, key)
    else:
        #this is a link
        logging.info('saving link -----> ' + node['url'])
        
        #create link params from the mode
        link_params =   {
                            'name'      : node['title'],
                            'url'       : node['url'],
                            'parent'    : parent
                        }
        #create new link with the params
        addLink(link_params)
        
        
def importServices(post):
    logging.info('importServices(): Start')
    
    usr = getCurrentUser() 
    
    bookmarkTree = json.loads(post.request.get('bookmarkTree'))
    
    logging.info('importServices: Saving bookmarks')
    saveBookmarks(bookmarkTree, usr.sysfolder_root)
    