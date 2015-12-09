#!/usr/bin/expect

set timeout 300

spawn scp -P 1314 -r assets  root@120.24.254.192:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.24.254.192's password:*" {
send "Hello1234\r";
exp_continue;
}
}

spawn scp -P 1314 -r bower_components  root@120.24.254.192:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.24.254.192's password:*" {
send "Hello1234\r";
exp_continue;
}
}

spawn scp -P 1314  -r build  root@120.24.254.192:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.24.254.192's password:*" {
send "Hello1234\r";
exp_continue;
}
}

spawn scp -P 1314  -r index.html root@120.24.254.192:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.24.254.192's password:*" {
send "Hello1234\r";
exp_continue;
}
}
