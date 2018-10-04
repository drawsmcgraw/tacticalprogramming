To build the venv for authoring and development:
```
virtualenv venv -p python3.6
source venv/bin/activate
pip install -U --force-reinstall pip
pip install -r requirements.txt 
```

Starting/Stopping the dev server
```
make devserver 
make stopserver 
```

The dev server listens on `locahost:8000` by default.

