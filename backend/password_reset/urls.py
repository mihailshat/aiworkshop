from django.urls import path
from . import views

urlpatterns = [
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/', views.reset_password, name='reset-password'),
] 