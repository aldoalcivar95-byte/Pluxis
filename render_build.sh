#!/usr/bin/env bash
set -o errexit

pip install pipenv
pipenv install --deploy

# Aplicar las migraciones de PostgreSQL antes de arrancar Flask
PYTHONPATH=src pipenv run flask --app app db upgrade
