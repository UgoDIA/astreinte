pipeline {
    agent any

    environment {
        APP_DIR = "/var/www/astreinte"
        VENV_DIR = "/var/www/astreinte/.venv"
    }

    stages {
        stage('Clone du repo git') {
            steps {
                script {
                   
                    echo "Repo cloné dans le workspace jenkins: ${env.WORKSPACE}"
                }
            }
        }

        stage('Install des dépendances python') {
            steps {
                script {
                    // venv temporaire pour le workspace jenkins
                    sh "python3 -m venv .venv"
                    sh "bash -c 'source .venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt'"
                }
            }
        }

        stage('Tests') {
            steps {
                script {
                    sh "bash -c 'export SSO_VALIDATE_URL=http://fake-sso.test && source .venv/bin/activate && python -m pytest tests/ -v --tb=short'"
                }
            }
        }

        stage('Déploiement en production') {
            steps {
                script {
                    // Sync les fichiers du workspace jenkins vers le dossier de prod 
                    
                    sh "sudo rsync -av --delete --exclude='.env' --exclude='astreinte.sock' ${env.WORKSPACE}/ ${APP_DIR}/"
                    sh "sudo chown -R www-data:www-data ${APP_DIR}"
                }
            }

        }


        stage('Restart services') {
            steps {
                script {
                    sh "sudo systemctl restart astreinte"
                    sh "sudo systemctl restart nginx"
                }
            }
        }
    }
    post {
        success {
            mail (
                subject: "✅ Succès du job Jenkins ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Le job Jenkins <b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> s'est terminé avec succès.</p>
                         <p>Vous pouvez consulter les détails ici : <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
                to: "ugofokyin@gmail.com",
                mimeType: 'text/html'
            )
        }
        failure {
            mail (
                subject: "❌ Échec du job Jenkins ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Le job Jenkins <b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> a échoué.</p>
                         <p>Consultez les logs ici : <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
                to: "ugofokyin@gmail.com",
                mimeType: 'text/html'
            )
        }
    }
}