$(document).ready(function(){
    $('.picture_slide_main').owlCarousel({
        margin:10,
        loop:true,
        items: 1,
        center: true,
        autoplay: true,
        autoplayTimeout:2500,
        autoplayHoverPause:true,
        animateOut: 'fadeOut'
    });
    $('#registerLink').on('click' ,function(){
        $('.card').addClass('flipped');
        var $this = $(this);
        if($this.data('clicked')) {
            resetRegSection();
        }
        else {
            $this.data('clicked', true);
        }
    });

    $('#loginLink').on('click' ,function(){
        var $this = $(this);
        if($this.data('clicked')) {
            resetLoginSection();
        }
        else {
            $this.data('clicked', true);
        }
        $('.card').removeClass('flipped');
    });


    //Register Validtion
    $.validator.setDefaults({
        errorClass: 'help-block',
        highlight: function(element) {
          $(element)
            .closest('.form-group')
            .addClass('has-error');
        },
        unhighlight: function(element) {
          $(element)
            .closest('.form-group')
            .removeClass('has-error').addClass('has-success');
        },
        errorPlacement: function (error, element) {
            if (element.prop('type') === 'checkbox') {
                error.insertAfter(element.parent());
            }
            else {
                error.insertAfter(element);
            }
        },
        onkeyup: function(element) {
            if (element.name == 'username'|| element.name == 'email') {
                return true;
            }
            if ( element.name in this.submitted || element ==
                this.lastElement ) {
                this.element(element);
            }
        }
    });

    $.validator.addMethod('strongPassword', function(value, element) {
        return this.optional(element)
          || value.length >= 7
          && /\d/.test(value)
          && /[a-z]/i.test(value);
    }, 'Must contain at least one number and one char');

    /*jQuery.validator.addMethod("notEqualTo", function(value, element, param) {
        return this.optional(element) || value != param;
    }, "Please specify a different (non-default) value");*/

    $(document).on('blur','#regform input',function(){
        $.unblockUI();
    });

    $("#regFrom").validate({
        onkeyup: false,
        rules: {
            userName:{
                required: true,
                minlength: 5,
                remote: "/username_Check/"
            },
            firstName:{
                required: true,
                minlength: 3,
            },
            lastName:{
                required: true,
                minlength: 3,
            },
            email: {
                required: true,
                email: true,
                remote: "/email_Check/"
            },
            pwd: {
                required: true,
                strongPassword: true
            },
            password2: {
                equalTo: "#pwd"
            },
            phone: {
                required: true,
                digits: true,
                phonesUK: true
            },
            userContact: {
                digits: true,
                minlength: 11
            },
            termsConditions: {
                required: true
            }
        },submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /user_registration/,
                data: $(form).serialize(),
                success: function(response) {
                    if(response.status=='1'){
                        msgText='<p>Your account has been created successfully! But the account has not been activated yet!</p>'+
                                '<p><p>Wait for Admin Approval!</p>'+
                                '<p>Contact: smartcareersite@gmail.com</p>';
                        swal({
                            title: 'Account created successfully!!!',
                            type: 'success',
                            html: msgText,
                            showCloseButton: true,
                        });
                        resetRegSection();
                    }
                    else{
                        swal({
                            position: 'top-right',
                            type: 'error',
                            title: 'Please try again!!!',
                            showConfirmButton: false,
                            timer: 2000,
                            toast:true
                        });
                        resetRegSection();
                    }
                }
            });
        },
        messages: {
            email: {
                required: 'Please enter an email address',
                email: 'Please enter a <em>valid</em> email address',
                remote: $.validator.format("{0} is already associated with an account")
            },
            termsConditions: "Please indicate that you accept the Terms and Conditions"
        }
    });

    $("#loginForm").validate({
        rules: {
            username:{
                required: true
            },
            password: {
                required: true
            }
        },submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /user_login/,
                data: $(form).serialize(),
                success: function(response) {
                    if(response.status=='1'){
                        window.location = "/"
                    }
                    if(response.status=='2'){
                        swal({
                            position: 'top-right',
                            type: 'error',
                            title: 'Username or Password Wrong or Account not activated!!!',
                            showConfirmButton: false,
                            timer: 2000,
                            toast:true
                        });
                        resetLoginSection();
                    }
                }
            });
        }
    });

    $('#id_email').addClass('form-control');
    $('#forgetPassResetBtn').on('click', function(){
        window.location = window.location.href;
    });
    if(location.pathname){
        urlPath=location.pathname;
        if(urlPath.split('/')[1]=='reset'){
            $('#registerLink').hide();
            $('#loginLink').hide();
        }
    }
    $("#passChangeForm").validate({
        rules: {
            oldPass:{
                required: true,
                remote: {
                    param: {
                        url: "/oldPass_Check/",
                        type: "POST",
                        data:{'csrfmiddlewaretoken': function() {
                                return $("input[name=csrfmiddlewaretoken]").val();
                            }
                        }
                    }
                }
            },
            newPass: {
                required: true,
                strongPassword: true,
                notEqualTo: "#oldPass"
            },
            newPassConfirm: {
                required: true,
                equalTo: "#newPass"
            },
        },
        messages: {
            newPass: {
              notEqualTo: "Can't be same as Old Password!"
            }
        },submitHandler: function(form) {
            $.ajax({
                type: $(form).attr('method'),
                url: /user_pass_change/,
                data: $(form).serialize(),
                success: function(response) {
                    if(response.status=='1'){
                        swal("Success!", "Successfully Updated!", "success");
                        resetPassChangeForm();

                    }
                    else{
                        swal("Error!", "Can't change!", "error");
                        resetPassChangeForm();
                    }
                }
            });
        }
    });
    function resetPassChangeForm(){
        var validator = $( "#passChangeForm" ).validate();
        validator.resetForm();
        $('#oldPass').val('');
        $('#newPass').val('');
        $('#newPassConfirm').val('');
        $('#changePassModal').modal('hide');
        $(":input").closest('.form-group').removeClass('has-success');
    }

    $('.termsConditionsLink').on('click',function(){
        termText = 'This site is developed only for self-study or practice and any kind of commercial use is strictly prohibited.The authority of supportincareer reserves all rights of editions & deletions of all information of this site in any time without showing any cause or notice to anyone';
        swal({
            title: 'Terms and Conditions',
            text: termText,
            type: "info",
            customClass: 'swal-wide',
            showConfirmButton:true
        });
    });

    function resetRegSection(){
        var validator = $( "#regFrom" ).validate();
        validator.resetForm();
        $("input[type=text]").val("");
        $(":input").closest('.form-group').removeClass('has-success');
    }
    function resetLoginSection(){
        var validator = $( "#loginForm" ).validate();
        validator.resetForm();
        $("input[type=text]").val("");
        $(":input").closest('.form-group').removeClass('has-success');
    }
});
