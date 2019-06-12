Title: Jenkins Pipelines and Docker - An Introduction
Date: 2019-11-06
Category: howto

# Problem
We have Jenkins. We also have a need to build and deploy a typical application (in this case, a Java application). We need a way to go from "I just installed Jenkins" to "We have a Jenkins pipeline that can build and deploy our code".

# Solution
We will install the bare minimum of extra packages on our Jenkins server (and slaves, if necessary), then write a pipeline to fetch, build, and deploy our code.

## A Word on Jenkins Plugins
As tempting as it may be to reach for the nearest Jenkins plugin, I implore you not to. The wonderful thing about Jenkins is the plugin ecosystem. The horrible thing about Jenkins is the plugin ecosystem. When you install a plugin, you create a dependency. These plugins will become obsolete (either through the maintainer leaving or some code conflict precluding a timely update) and you will be stuck on your version of Jenkins forever. No security updates, no features updates. Calcified Jenkins Forever.

Don't use the plugins. You won't miss them.

## A Word on Declarative vs Scripted Pipelines
Scripted pipelines are described as for power users or people who want advanced features. I am almost always guilty of falling into this category but for this topic, I'm changing my opinion. It's very easy to do the wrong thing in Jenkins. Using a framework that has more features means you'll have more rope to hang yourself with in the future. By using declarative pipelines, we're better aligning with the [12 Factor Principles](https://12factor.net/) and we're reducing the chance that we'll write a pipeline that's impossible to maintain. If you need the power of a scripted pipeline, then you've designed your pipeline incorrectly.

Use declarative pipelines.

## Install Docker
Let's start by installing Docker on our Jenkins server (and slaves, if necessary). 

I'll just leave a few links here, since anything I write here won't be updated but the docs will.

* [Install Docker on CentOS](https://docs.docker.com/install/linux/docker-ce/centos/)
* [Install Docker on Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

If you have several slaves, this could take a while. If you don't already have something in place, maybe we should talk about some [config management]({filename}salted-vmware-part-01.md)  [solutions]({filename}salt-reactor-dnsmasq.md)?

Once installed, you'll want to add the `jenkins` user to the docker group and restart Jenkins.

```
usermod -a -G docker jenkins

# Or however you restart Jenkins
systemctl restart jenkins
```

Done? Great! Let's move on.

## Install Git
Yes, seriously. It's probably already there but if you built your Jenkins from a minimal image, you don't have it. Just install Git, else the `git` steps will fail (obviously).


## Write Our Pipeline File

Best done by example.

```groovy
// Simple example of fetching code, building it using a Docker container,
// and pushing it to production on Cloud Foundry.

pipeline {

    // Environment variables always go up top. That way, you know where to find them :)
    environment {

       // This function call to credentials() will create two extra
       // variables: PCF_CREDS_USR and PCF_CREDS_PSW.
       // ref: https://jenkins.io/doc/book/pipeline/jenkinsfile/#handling-credentials
       PCF_CREDS =    credentials('dev_pcf')

       PCF_ENDPOINT = 'api.sys.pcf.lab.homelab.net'
       PCF_ORG =      'demo'
       PCF_SPACE =    'demo'
    }

    // Don't care who runs it
    agent any

    stages {

        // Note: Requires that git be installed on the Jenkins machine/slave.
        stage('Fetch') {
            steps {
                git 'https://gitlab.com/drawsmcgraw/hello-ci.git'
            }
        }

        // Build inside a container since builds can be messy.
        stage('Build') {
            agent {
                docker {
                    image 'maven:3.6.1-jdk-8'
                }
            }
            steps {
                sh 'mvn package'
            }
        }

        stage('Deploy') {
            steps {

                // Multiline shell steps are supported (and useful for readability)
                sh """
                curl --location "https://cli.run.pivotal.io/stable?release=linux64-binary&source=github" | tar zx 
                ./cf login --skip-ssl-validation -u $PCF_CREDS_USR -p $PCF_CREDS_PSW -a $PCF_ENDPOINT -o $PCF_ORG -s $PCF_SPACE
                ./cf push
                """
            }
        }
    }
}
```

Note: This is also available [on Github](https://github.com/drawsmcgraw/pipeline-examples/blob/master/jenkins/build-with-docker-and-cf-push.groovy)

## Details

Note that the `docker` definition is inside the `Build` stage. This is intentional. When using Docker in a Jenkins pipeline, you can specify a container for each individual step or, if you move the definition into the global scope, specify the same container for all images. It's worth noting that if you specify a container for one stage but not the others, then the other stages will _not_ run inside a container. 

When using this feature, what Jenkins is actually doing under the hood is launching a container, mapping the Jenkins workspace as a volume inside the container, and using the `-w` flag to define the container working directory to be that workspace. The end result is that any artifacts generated by said container are available in the workspace. This is different from other paradigms that I've seen, which require you to specify artifacts you want carried from one container to the next.

## Last Thoughts
If you'd like to avoid the Docker angle and just want to run this pipeline on the bare Jenkins machine, it's just a matter of removing the `docker` blocks from the pipeline. Jenkins will happily run the specified commands inside the workspace instead of inside a container.

## Conclusion
In short, the KISS principle is key when it comes to Jenkins. Stick with declarative pipelines, avoid plugins, and keep your tasks easy to read.
