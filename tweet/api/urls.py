from django.conf.urls import url
from .views import (
        TweetListAPIView,
        TweetCreateAPIView,
        RetWeetAPIView,
        LikeToggleAPIView
    )

urlpatterns = [
    url(r'^$', TweetListAPIView.as_view(),name="list"),
    url(r'^create/', TweetCreateAPIView.as_view(),name="create"),
    url(r'^like/(?P<pk>\d+)$',LikeToggleAPIView.as_view(),name='like-toggle'),
    url(r'^retweet/(?P<pk>\d+)$',RetWeetAPIView.as_view(),name='retweet'),
    # url(r'^update/(?P<pk>\d+)$',TweetUpdateView.as_view(),name='update'),
    # url(r'^delete/(?P<pk>\d+)$',TweetDeleteView.as_view(),name='delete'),
]
