from django.shortcuts import render
from django.http import  HttpResponseRedirect

from blogApp.models import Post
from .forms import SignUpForm, UserLoginForm, PostForm
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate 
from django.contrib.auth.models import Group

# Create your views here.

def dashboard(request):
    if request.user.is_authenticated:
        posts = Post.objects.all()
        return render(request, "blogApp/dashboard.html", {'posts':posts})
    else:
        return HttpResponseRedirect("/login")

def contact(request):
    return render(request, "blogApp/contact.html")

def about(request):
    return render(request, "blogApp/about.html")

def home_page(request):
    post = Post.objects.all()
    return render(request, "blogApp/home.html",{"POST":post})

def user_signup(request):
    if request.method=="POST":
        form = SignUpForm(request.POST)
        #print(form)
        if form.is_valid():
            messages.success(request, 'Congrats!! User Created Successfully!')
            user = form.save()
            group = Group.objects.get(name='Author')
            user.groups.add(group)
    else:
        form = SignUpForm()
    return render(request, "blogApp/sign_up.html", {'form' : form})

def user_login(request):
    if not request.user.is_authenticated:
        if request.method=="POST":
            form = UserLoginForm(request=request, data=request.POST)
            if form.is_valid():
                uname = form.cleaned_data['username']
                upass = form.cleaned_data['password']
                user = authenticate(username=uname, password=upass)
                if user is not None:
                    login(request,user)
                    messages.success(request,"Logged In Successfully!!")
                    return HttpResponseRedirect("/dashboard")
        else:
            form = UserLoginForm()
        return render(request, "blogApp/login.html", {'form': form})
    else:
        return HttpResponseRedirect("/dashboard")

def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def add_post(request):
    if request.user.is_authenticated:
        if request.method=="POST":
            form = PostForm(request.POST)
            if form.is_valid():
                title = form.cleaned_data['title']
                desc = form.cleaned_data['desc']
                pst = Post(title=title, desc=desc)
                pst.save()
                form = PostForm()
        else:
            form = PostForm()
        return render(request, "blogApp/addpost.html", {'form':form})
    else:
        return HttpResponseRedirect("/login")

def update_post(request, id):
    if request.user.is_authenticated:
        if request.method=="POST":
            pi = Post.objects.get(pk=id)
            form = PostForm(request.POST,instance=pi)
            if form.is_valid():
                form.save()
        else:
            pi = Post.objects.get(pk=id)
            form = PostForm(instance=pi)
        return render(request, "blogApp/update.html",{'form':form})
    else:
        return HttpResponseRedirect("/login")

def delete_post(request, id):
    if request.user.is_authenticated:
        if request.method=="POST":
            pi = Post.objects.get(pk=id)
            pi.delete()
            return HttpResponseRedirect('/dashboard/')
    else:
        return HttpResponseRedirect('/login')


'''
{% url 'updatepost' %}

'''