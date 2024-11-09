SERVER_ERROR = 'Server Error '

const getTagValue = (element) => {
    return  element.target.dataset.id
}

const getDataValue = (element, attribute) => {
    return $(element).data(attribute)
}

const toastNotification = (type, message) => {
    const notyf = new Notyf({
        position: {
            x: 'right',
            y: 'top',
        },
        duration: 9000,
        icon: false,
        dismissible:true
    });
    if (type === 'success') {
        notyf.success({
            message: message
        });
    } else if (type === 'error') {
        notyf.error({
            message: message
        });
    }
};

function formToJson($form, except = null) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    if (except) {
        $.map(except, function (e) {
            delete indexed_array[e]
        })
    }
    return JSON.stringify(indexed_array);
}


$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

$(document).ajaxError(function(event, jqxhr, settings, exception) {
    if (jqxhr.status === 419) {  // CSRF token mismatch
        // alert('Session expired. Reloading the page...');
        setTimeout(function() {
            location.reload();  // Reload after showing the message for a few seconds
        }, 3000);
    }
});


function ajaxRequest(data, method, url, callback,notificationHandler = toastNotification) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            callback(response)
        },
        error: function (response) {
            if (response.status != 200 | 201) {
                if (response.status == 400) {
                    errorResponse = response.responseJSON
                    if (errorResponse.message) {
                        notificationHandler('error',errorResponse.message);
                    }
                    if(errorResponse.type == 'form'){
                        $.each(errorResponse.errors, function(key, value) {
                            let input = $('[name=' + key + ']');
                            input.addClass('is-invalid');
                            input.next('.invalid-feedback').remove();
                            // Iterate through each error message in the `value` array and display it
                            $.each(value, function(index, errorMessage) {
                                // Append each error message after the input field
                                input.after('<div class="invalid-feedback">' + errorMessage + '</div>');
                            });
                        });
                    }
                    return false
                } else if (response.status == 500) {
                    notificationHandler('error',SERVER_ERROR);
                }
            } else {
                if (callback != null) {
                    callback(response)
                }
            }
        }
    });
}


function handlerGlobalAjaxError() {
    $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
        jsonError = jqxhr.responseJSON
        if (jqxhr.status != 200) {
            if (jqxhr.status == 400) {
                console.log("validation errors cache from globalAjax Error Handler")
            } else if (jqxhr.status == 500) {
                swal("Erreur !", SERVER_ERROR, "error");
            }
        }

    });
}

function spinnerShow(submitBtn, spinnerBtn, labelBtn, labelText) {
    submitBtn.attr('disabled', true);
    spinnerBtn.addClass('spinner-border');
    labelBtn.text(labelText);
}

function spinnerHide(submitBtn, spinnerBtn, labelBtn, labelText) {
    submitBtn.attr('disabled', false);
    spinnerBtn.removeClass('spinner-border');
    labelBtn.text(labelText);
}

function updateSpinnerUI($form, $submitBtn, $spinProgress, onPause) {
    $form.css('opacity', onPause ? 1 : 0.4);
    $spinProgress.css('display', onPause ? 'none' : 'inline-block');
    $submitBtn.prop('disabled', !onPause);
}

function ajaxUploadRequest(data, method, url, callback,beforCallback=null,completedCallback = null,notificationHandler = toastNotification) {
    $('#loadingIndicator').show(); //
    $.ajax({
        url: url,
        dataType: 'json',
        cache: false,
        // contentType: "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" ,
        contentType: false,
        // mimeType: 'multipart/form-data', ;boundary=gc0p4Jq0M2Yt08jU534c0p
        processData: false,
        data: data,
        type: method,
        success: function (response) {
            $('#loadingIndicator').hide(); //
            callback(response)
        },
        error: function (response) {
            $('#loadingIndicator').hide(); //
            if (response.status != 200) {
                if (response.status == 400) {
                    errorResponse = response.responseJSON
                    if (errorResponse.message) {
                        notificationHandler('error',errorResponse.message);
                    }
                    if(errorResponse.type == 'form'){
                        $.each(errorResponse.errors, function(key, value) {
                            let input = $('[name=' + key + ']');
                            input.addClass('is-invalid');
                            input.next('.invalid-feedback').remove();
                            // Iterate through each error message in the `value` array and display it
                            $.each(value, function(index, errorMessage) {
                                // Append each error message after the input field
                                input.after('<div class="invalid-feedback">' + errorMessage + '</div>');
                            });
                        });
                    }
                    return false
                }
            } else {
                if (callback != null) {
                    callback(response)
                }
            }
        },
        beforeSend: function () {
            if (beforCallback != null) {
                beforCallback()
            }
        },
        complete: function () {
            if (completedCallback != null) {
                completedCallback()
            }
        }
    });
}


function response(response) {
    if (response.error) {
        swal("Failure !", response.message, "error");
    } else {
        swal("Successful", response.message, "success")
            .then((value) => {
                location.reload()
            });

    }
}

function responseSwal(response) {
    const swalType = response.error ? "error" : "success";
    const swalTitle = response.error ? "Failure!" : "Successful";
    swal(swalTitle, response.message, swalType);
}


function responsewithData(response) {
    if (response.error) {
        swal("Failure !", response.message, "error");
    } else {
        swal("Successful", response.message, "success")
            .then((value) => {
                location.replace(response.data.url)
            });
    }
}

function swalAlert(title, text, obj, data, methode, link, response) {
    $this = obj
    swal({
            title: title,
            text: text,
            icon: "warning",
            buttons: {
                cancel: 'NO',
                catch: {
                    text: 'YES',
                    value: 'confirm'
                }
            },
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajaxRequest(data, methode, link, response)
                $($this.parent().parent()).remove();
            } else {
                swal("ACTION CANCELED");
            }
        });
}

function getDataIPInfo() {
    var dataArray = [];

    $.ajax({
        url: "https://ipinfo.io/json",
        type: "GET",
        success: function(response) {
            dataArray = (response);
        },
        error: function(xhr, status, error) {
            // console.error("Error:", error);
        },
        async: false
    });
    delete dataArray['readme'];
    return dataArray;
}


function processData(data) {
    data = JSON.parse(data);
    data['geolocalisation'] = getDataIPInfo();
    data = JSON.stringify(data);
    return data;

}
