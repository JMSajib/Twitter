from django.conf.urls import url
from .views import UserDetailView

urlpatterns = [
    # url(r'^$', TweetListView.as_view(),name="list"),
    # url(r'^create/', TweetCreateView.as_view(),name="create"),
    url(r'^(?P<username>[\w.@+-]+)/$',UserDetailView.as_view(),name='detail'),
    # url(r'^update/(?P<pk>\d+)$',TweetUpdateView.as_view(),name='update'),
    # url(r'^delete/(?P<pk>\d+)$',TweetDeleteView.as_view(),name='delete'),
]
