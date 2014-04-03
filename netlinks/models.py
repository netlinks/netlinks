
from google.appengine.ext import ndb


#######################################################################################################################
############################          Datatore Models         #########################################################
#######################################################################################################################

#Datastore object to store URL and associated properties
class Link(ndb.Model):
    name = ndb.StringProperty()  # file name - by default, url, but user may edit it
    description = ndb.StringProperty()  # Description about the link
    url = ndb.TextProperty() # To store the complete URL. Max length of 'String' is 500. So using TextProperty
    website = ndb.StringProperty() # To store only the website address. Eg. www.youtube.com
    file_type = ndb.StringProperty()    # To sore the content type. Eg, video, article, application. These are called system folders
    parent_folder = ndb.KeyProperty(kind='Folder')  #Reference to parent folder
    date_c = ndb.DateTimeProperty() #Date created
    date_m = ndb.DateTimeProperty() #Date modified
    path = ndb.StringProperty() #path to the file type
    

#Datastore object to store folder details and associated properties
class Folder(ndb.Model):
    name = ndb.StringProperty()  #Folder Name
    parent_folder = ndb.KeyProperty(kind='Folder')  #Reference to parent folder
        
    date_c = ndb.DateTimeProperty() #Date created
    date_m = ndb.DateTimeProperty() #Date Modified
    n_items = ndb.IntegerProperty()  #Number of items in the folder
    path = ndb.StringProperty() #Path to this folder
        
    icon = ndb.StringProperty()  #Folder Icon
    color = ndb.StringProperty() #Folder Color
    view = ndb.StringProperty()  #view type of folder - list, grid etc.
    
#Datastore object to store user details and associated properties
class User(ndb.Model):
    user_name = ndb.StringProperty()  #User full name
    nick_name = ndb.StringProperty()  #User nick name
    email = ndb.StringProperty()  # email address
    address = ndb.StringProperty()  #address
    phone = ndb.StringProperty()  #phone number
    sysfolder_root = ndb.KeyProperty(kind='Folder')
    sysfolder_mydrive = ndb.KeyProperty(kind='Folder')
    sysfolder_videos = ndb.KeyProperty(kind='Folder')
    sysfolder_articles = ndb.KeyProperty(kind='Folder')
    sysfolder_images =  ndb.KeyProperty(kind='Folder')
    sysfolder_apps = ndb.KeyProperty(kind='Folder')

    
# Need to add user preferences - may be in later versions 

################################### End of Datastore models ###########################################################


