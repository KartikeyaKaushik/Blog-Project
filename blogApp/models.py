from django.db import models

# Create your models here.

class Post(models.Model):
    title = models.TextField()
    desc = models.TextField()

    def __str__(self):
        return self.title