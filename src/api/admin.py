import os
import inspect
import bcrypt

from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme
from wtforms import PasswordField

from . import models
from .models import db

class UserModelView(ModelView):

    column_exclude_list = ["password"]

    form_extra_fields = {
        "password": PasswordField("Password")
    }

    def create_model(self, form):
        try:
            user = models.User()

            form.populate_obj(user)

            user.password = bcrypt.hashpw(
                form.password.data.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            self.session.add(user)

            self._on_model_change(form, user, True)

            self.session.commit()

            return True

        except Exception:
            self.session.rollback()
            raise

    def update_model(self, form, model):
        try:
            current_password = model.password

            form.populate_obj(model)

            if form.password.data:
                model.password = bcrypt.hashpw(
                    form.password.data.encode("utf-8"),
                    bcrypt.gensalt()
                ).decode("utf-8")
            else:
                model.password = current_password

            self._on_model_change(form, model, False)

            self.session.commit()

            return True

        except Exception:
            self.session.rollback()
            raise

def setup_admin(app):

    app.secret_key = os.environ.get(
        "FLASK_APP_KEY",
        "sample key"
    )

    admin = Admin(
        app,
        name="4Geeks Admin",
        theme=Bootstrap4Theme(
            swatch="cerulean"
        )
    )

    for name, obj in inspect.getmembers(models):

        if inspect.isclass(obj) and issubclass(obj, db.Model):

            if obj is models.User:
                admin.add_view(
                    UserModelView(obj, db.session)
                )
            else:
                admin.add_view(
                    ModelView(obj, db.session)
                )