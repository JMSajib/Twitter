from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from .models import Tweet

User = get_user_model()
# Create your tests here.
class TweetModelTestCase(TestCase):
    def setUp(self):
        random_user = User.objects.create(username='Sajib1111111')

    def test_tweet_item(self):
        obj = Tweet.objects.create(
                user = User.objects.first(),
                content = "Some random Content"
            )
        self.assertTrue(obj.content == "Some random Content")
        self.assertTrue(obj.id == 1)
        absolute_url = reverse("tweet:detail",kwargs={"pk":1})
        self.assertEqual(obj.get_absolute_url(),absolute_url)

    def test_tweet_url(self):
        obj = Tweet.objects.create(
                user = User.objects.first(),
                content = "Some random Content"
            )
        absolute_url = reverse("tweet:detail",kwargs={"pk":obj.pk})
        self.assertEqual(obj.get_absolute_url(),absolute_url)
