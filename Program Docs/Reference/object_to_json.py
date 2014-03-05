import json

class person:
        pass

class folder:
        pass


p = person()
p.name = 'jubair123'
p.age = 26

f = folder()
f.name = 'new folder'
f.icon ='default'

obj = {'person':[], 'folder':[]}

obj['person'].append(p.__dict__)
obj['folder'].append(f.__dict__)
json_obj = json.dumps(obj)

print json_obj

print obj['person'][0]['name']
print obj['folder'][0]['name']
