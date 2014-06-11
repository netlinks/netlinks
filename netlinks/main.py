
import webapp2
import logging

#import only required functions. Do not use wild import (*)
from renderpages import renderWelcomePage, renderFolderPage, renderTestFolderPage
from coreservices import isUserSignedUp, isUserSignedIn  
from userservices import addUser     
from folderservices import folderServices   
from linkservices import linkServices
from importservices import importServices

############################################ USER ACTION HANDLERS #####################################################

############################################# Main Page '/' ###########################################################
class MainPage(webapp2.RequestHandler):

	def get(self):
		
		if not isUserSignedIn(): 						#If user is not signed in redirect to welcome page
			logging.info(' Mainpage.get(): User is not signed in, redirecting to login page')
			renderWelcomePage(self)        #call for the function to render welcome page
			return			
		
		#If user is signed in but not registered, register the user - add user to system and render folder page
		elif not isUserSignedUp():	
			logging.info('Mainpage.get(): User is not signed up. Adding user.')
			addUser()
			logging.info('Mainpage.get(): User added. Now rendering folder view')
			renderFolderPage(self)   #call for the function to render folders of a user
			return
		
		#If user is signedup and registed, directly render folder page
		else:
			renderFolderPage(self)
		
		

############################################ FOLDER ACTION HANDLERS #####################################################

class Folder(webapp2.RequestHandler):
	
	def post(self):
		
		if not isUserSignedIn(): 						#If user is not signed in dont do anything
			logging.info(' Folder.get(): User is not signed in, exiting')
			return		
		
		logging.info('Folder.post(): calling folderServices module')		
		folderServices(self)		
		
############################################ LINKS ACTION HANDLERS #####################################################

class Link(webapp2.RequestHandler):
		
	def post(self):
		
		if not isUserSignedIn(): 						#If user is not signed in dont do anything
			logging.info(' Link.post(): User is not signed in, exiting')
			self.response.out.write("LOGIN FAILED")
			return		
		
		logging.info('Link.post(): calling linkServices module')		
		linkServices(self)		

############################################ Application handling #####################################################

class App(webapp2.RequestHandler):
		
	def post(self):
		
		if not isUserSignedIn(): 						#If user is not signed in dont do anything
			logging.info(' App.get(): User is not signed in, exiting')
			return		
		
		appid = self.request.get('appid')
		url = self.request.get('params')
		
		self.response.out.write(url)


############################################ END of Application handling #####################################################



############################################ Application handling #####################################################

class Import(webapp2.RequestHandler):
		
	def post(self):
		
		if not isUserSignedIn(): 						#If user is not signed in dont do anything
			logging.info(' App.get(): User is not signed in, exiting')
			return		
		
		importServices(self)
		
		self.response.out.write('brewing the bookmark tree')

############################################ END of Application handling #####################################################



############################################ TEST TEST TEST TEST TEST #####################################################
############################################ TEST TEST TEST TEST TEST #####################################################
############################################ TEST TEST TEST TEST TEST #####################################################


class Test(webapp2.RequestHandler):
	def get(self):
		
		if not isUserSignedIn(): 						#If user is not signed in redirect to welcome page
			logging.info(' Test.get(): User is not signed in, redirecting to login page')
			renderWelcomePage(self)        #call for the function to render welcome page
			return		
		
		#if user is logged in then..
		logging.info('Test.get(): calling renderTestFolderPage module')
		renderTestFolderPage(self)   #call for the function to render folders of a user
		

############################################## Entry Point ! ################################################################

app = webapp2.WSGIApplication([
	('/', MainPage),
	('/folder', Folder),
	('/link', Link),
	('/app', App),
	('/import', Import),
	('/test', Test),
	], debug=True)



