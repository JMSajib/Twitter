from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render,get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import DeleteView,DetailView,ListView,CreateView,UpdateView
from .forms import TweetModelForm
from .models import Tweet
from .mixins import FormUserNeededMixin,UserOwnerMixin

# Create your views here.

class TweetCreateView(FormUserNeededMixin,CreateView):
    form_class = TweetModelForm
    template_name = "tweet/create_form.html"

class TweetListView(ListView):
    queryset = Tweet.objects.all()

class TweetDetailView(DetailView):
    model = Tweet

class TweetUpdateView(UserOwnerMixin,UpdateView):
    queryset = Tweet.objects.all()
    form_class = TweetModelForm
    template_name = "tweet/update_view.html"
    success_url = "/"

class TweetDeleteView(DeleteView):
    model = Tweet
    template_name = "tweet/confirm_delete.html"
    success_url = reverse_lazy('tweet:list')
