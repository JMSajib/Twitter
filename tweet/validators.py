from django.core.exceptions import ValidationError

def validate_content(value):
    content = value
    if(content == ""):
        raise ValidationError("Content cant be Empty")
    return value
