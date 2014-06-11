
from google.appengine.ext import ndb


#######################################################################################################################
############################          Datatore Models         #########################################################
#######################################################################################################################

#Datastore object to store URL and associated properties
class Link(ndb.Model):
    date_c = ndb.DateTimeProperty() #Date created
    date_m = ndb.DateTimeProperty() #Date modified
    description = ndb.StringProperty()  # Description about the link
    file_type = ndb.StringProperty()    # To sore the content type. Eg, video, article, application. These are called system folders
    icon = ndb.StringProperty()  #File Icon
    name = ndb.StringProperty()  # file name - by default, url, but user may edit it
    parent_folder = ndb.KeyProperty(kind='Folder')  #Reference to parent folder
    path = ndb.StringProperty() #path to the file type
    url = ndb.TextProperty() # To store the complete URL. Max length of 'String' is 500. So
    website = ndb.StringProperty() # To store only the website address. Eg. www.youtube.com

#Datastore object to store folder details and associated properties
class Folder(ndb.Model):
    color = ndb.StringProperty() #Folder Color
    date_c = ndb.DateTimeProperty() #Date created
    date_m = ndb.DateTimeProperty() #Date Modified
    icon = ndb.StringProperty()  #Folder Icon
    name = ndb.StringProperty()  #Folder Name
    n_items = ndb.IntegerProperty()  #Number of items in the folder
    parent_folder = ndb.KeyProperty(kind='Folder')  #Reference to parent folder
    path = ndb.StringProperty() #Path to this folder    
    view = ndb.StringProperty()  #view type of folder - list, grid etc.
    
#Datastore object to store user details and associated properties
class User(ndb.Model):
    address = ndb.StringProperty()  #address
    email = ndb.StringProperty()  # email address
    nick_name = ndb.StringProperty()  #User nick name
    phone = ndb.StringProperty()  #phone number
    sysfolder_apps = ndb.KeyProperty(kind='Folder')
    sysfolder_articles = ndb.KeyProperty(kind='Folder')
    sysfolder_images =  ndb.KeyProperty(kind='Folder')
    sysfolder_links = ndb.KeyProperty(kind='Folder')
    sysfolder_root = ndb.KeyProperty(kind='Folder')
    sysfolder_videos = ndb.KeyProperty(kind='Folder')
    user_name = ndb.StringProperty()  #User full name
    
# Need to add user preferences - may be in later versions 

################################### End of Datastore models ###########################################################


