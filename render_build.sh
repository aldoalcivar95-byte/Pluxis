#!/usr/bin/env bash
set -o errexit

pip install pipenv
pipenv install --deploy

PYTHONPATH=src pipenv run flask --app app db upgrade
