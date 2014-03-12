from google.appengine.api import users

import webapp2
import logging


#import only required functions. Do not use wild import (*)
from renderpages import renderWelcomePage, renderFolderPage, renderTestFolderPage    
from userservices import addUser, isUserSignedUp    
from folderservices import folderServices   
from linkservices import linkServices

############################################ USER ACTION HANDLERS #####################################################

############################################# Main Page '/' ###########################################################
class MainPage(webapp2.RequestHandler):

	def get(self):
		user = users.get_current_user()		#Check if user is already signed
		
		if not user: 						#If user is not signed in redirect to welcome page
			logging.info(' Mainpage.get(): User is not signed in, redirecting to login page')
			renderWelcomePage(self)        #call for the function to render welcome page
			return			
		
		#If user is signed in but not registered, register the user - add user to system and render folder page
		elif isUserSignedUp(user.user_id()):	
			addUser()   
			renderFolderPage(self)   #call for the function to render folders of a user
			
			#renderSignupPage(self,user)		 #call for the function to render signup page	
			return
		
		#If user is signedup and registed, directly render folder page
		else:
			renderFolderPage(self)
		
		
############################################# signup action  '/signup' ####################################################

class Signup(webapp2.RequestHandler):
	
	def post(self):
		logging.info('Signup.post(): calling addUser module')		
		addUser(self)   #call for the function which adds user details
		
		self.redirect("/")

############################################ FOLDER ACTION HANDLERS #####################################################

class Folder(webapp2.RequestHandler):
	
	def post(self):
		user = users.get_current_user()		#Check if user is already signed
		
		if not user: 						#If user is not signed in dont do anything
			logging.info(' Mainpage.get(): User is not signed in, exiting')
			return		
		
		logging.info('Folder.post(): calling folderServices module')		
		folderServices(self)		

############################################ LINKS ACTION HANDLERS #####################################################

class Link(webapp2.RequestHandler):
		
	def post(self):
		
		user = users.get_current_user()		#Check if user is already signed
		
		if not user: 						#If user is not signed in dont do anything
			logging.info(' Mainpage.get(): User is not signed in, exiting')
			return		
		
		logging.info('Link.post(): calling linkServices module')		
		linkServices(self)		

############################################ Application handling #####################################################

class App(webapp2.RequestHandler):
		
	def post(self):
		
		user = users.get_current_user()		#Check if user is already signed
		
		if not user: 						#If user is not signed in dont do anything
			logging.info(' Mainpage.get(): User is not signed in, exiting')
			return		
		
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
		
		
		#if user is logged in then..
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



