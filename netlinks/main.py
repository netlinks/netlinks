import webapp2
import logging

from models import *	#import all datastore models from models.py
from renderpages import *   #import all functions from renderpages.py
from userservices import *   #import all functions from userservices.py
from folderservices import *   #import all functions from folderservices.py
from linkservices import *

############################################ USER ACTION HANDLERS #####################################################

############################################# Main Page '/' ###########################################################
class MainPage(webapp2.RequestHandler):

	def get(self):
		user = users.get_current_user()		#Check if user is already signed
		
		if not user: 						#If user is not signed in redirect to welcome page
			logging.info(' Mainpage.get(): User is not signed in, redirecting to login page')
			renderWelcomePage(self)        #call for the function to render welcome page
			return			
		
		elif isUserSignedUp(user.user_id()):	#If user is signed in but not registered, follow registration procedure
			logging.info(' Mainpage.get(): User is signed in, but not registered, redirecting to signup page ')
			renderSignupPage(self,user)		 #call for the function to render signup page	
			return
		
		else:							#if user is signed in and already registered, redirect to folder view page		
			logging.info(' Mainpage.get(): Registered user. Rendering folder page')
			renderFolderPage(self)   #call for the function to render folders of a user
			return
		
############################################# signup action  '/signup' ####################################################

class Signup(webapp2.RequestHandler):
	
	def post(self):
		logging.info('Signup.post(): calling addUser module')		
		addUser(self)   #call for the function which adds user details
		
		self.redirect("/")

############################################ FOLDER ACTION HANDLERS #####################################################

class Folder(webapp2.RequestHandler):
		
	def post(self):
		logging.info('Folder.post(): calling folderServices module')		
		folderServices(self)		

############################################ LINKS ACTION HANDLERS #####################################################

class Link(webapp2.RequestHandler):
		
	def post(self):
		logging.info('Link.post(): calling linkServices module')		
		linkServices(self)		

############################################ Application handling #####################################################

class App(webapp2.RequestHandler):
		
	def post(self):
		appid = self.request.get('appid')
		url = self.request.get('params')
		
		self.response.out.write(url)


############################################ END of Application handling #####################################################




############################################ TEST TEST TEST TEST TEST #####################################################
############################################ TEST TEST TEST TEST TEST #####################################################
############################################ TEST TEST TEST TEST TEST #####################################################


class Test(webapp2.RequestHandler):
	def get(self):
		
		user = users.get_current_user()		#Check if user is already signed
		
		if not user: 						#If user is not signed in redirect to welcome page
			logging.info(' Mainpage.get(): User is not signed in, redirecting to login page')
			renderWelcomePage(self)        #call for the function to render welcome page
			return		
		
		logging.info('Test.get(): calling renderTestFolderPage module')
		renderTestFolderPage(self)   #call for the function to render folders of a user
		

############################################## Entry Point ! ################################################################

app = webapp2.WSGIApplication([
	('/', MainPage),
	('/signup', Signup),
	('/folder', Folder),
	('/link', Link),
	('/app', App),
	('/test', Test),
	], debug=True)



