
from google.appengine.api import users

import jinja2
import os
import logging

from coreservices import getCurrentUser


jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))


################################### Page Rendering Services ##########################################################

def renderWelcomePage(page):
    logging.info('renderWelcomePage(): Start')
    login_url = users.create_login_url('/')
    template_values = {
                    'login_url': login_url,
    }
    template = jinja_environment.get_template('/static/html/welcome.html')
    page.response.write(template.render(template_values))

def renderSignupPage(page,user):
    logging.info('renderSignupPage(): Start')
    greeting = "Helloooo "+user.nickname()+", One moment for Signup please...."
    logout_url = users.create_logout_url('/')
            
    template_values = {
                    'message': greeting,
                    'logout_url': logout_url
    }
    template = jinja_environment.get_template('/static/html/signup.html')
    page.response.write(template.render(template_values))

def renderFolderPage(page):
    logging.info('renderFolderPage(): Start')
    user = users.get_current_user()
    
    greeting = user.nickname()
    logout_url = users.create_logout_url('/')

    #get current user datastore object 
    usr = getCurrentUser()   

    #get system folder keys for this user and covert keys to urlsafe
    folder_mydrive = usr.sysfolder_mydrive.get()
    folder_videos = usr.sysfolder_videos.get()
    folder_articles = usr.sysfolder_articles.get()
    folder_images = usr.sysfolder_images.get()
    folder_apps = usr.sysfolder_apps.get()
       
    template_values = {
                    'message': greeting,
                    'logout_url': logout_url,
                    'folder_mydrive' : folder_mydrive,
                    'folder_videos' : folder_videos,
                    'folder_articles' : folder_articles,
                    'folder_images' : folder_images,
                    'folder_apps' : folder_apps
    }
    template = jinja_environment.get_template('/static/html/folder.html')
    page.response.write(template.render(template_values))
            
############################################ End of Page Rendering Services #####################################################







#FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING
#FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING
#FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING
#FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING FOR TESTING


def renderTestFolderPage(page):
    logging.info('renderTestFolderPage(): Start')
    user = users.get_current_user()
    
    greeting = user.nickname()
    logout_url = users.create_logout_url('/')

    #get current logged in user 
    usr = getCurrentUser()   

    #get system folder keys for this user and covert keys to urlsafe
    folder_mydrive = usr.sysfolder_mydrive.get()
    folder_videos = usr.sysfolder_videos.get()
    folder_articles = usr.sysfolder_articles.get()
    folder_images = usr.sysfolder_images.get()
    folder_apps = usr.sysfolder_apps.get()
       
    template_values = {
                    'message': greeting,
                    'logout_url': logout_url,
                    'folder_mydrive' : folder_mydrive,
                    'folder_videos' : folder_videos,
                    'folder_articles' : folder_articles,
                    'folder_images' : folder_images,
                    'folder_apps' : folder_apps
    }
    template = jinja_environment.get_template('/static/html/test.html')
    page.response.write(template.render(template_values))
            


