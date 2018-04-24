from django.conf.urls import url,include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from .views import home
from hashtags.views import HashTagView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^tags/(?P<hashtag>.*)/$', HashTagView.as_view(),name="hashtag"),
    url(r'^', include('tweet.urls',namespace='tweet')),
    url(r'^api/', include('tweet.api.urls',namespace='tweet-api')),
    url(r'^', include('accounts.urls',namespace='profiles')),
]
if settings.DEBUG:
    urlpatterns += (static(settings.STATIC_URL, document_root=settings.STATIC_ROOT))
