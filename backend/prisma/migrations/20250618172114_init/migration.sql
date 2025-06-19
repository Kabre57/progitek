-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "role_id" INTEGER,
    "reset_password_token" VARCHAR(255),
    "reset_password_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "theme" VARCHAR(50) DEFAULT 'light',
    "display_name" VARCHAR(200),
    "dob" DATE,
    "balance" DECIMAL(10,2) DEFAULT 0,
    "phone" VARCHAR(20),
    "email_status" VARCHAR(20) DEFAULT 'verified',
    "kyc_status" VARCHAR(20) DEFAULT 'pending',
    "last_login" TIMESTAMP(3),
    "status" VARCHAR(20) DEFAULT 'active',
    "address" TEXT,
    "state" VARCHAR(100),
    "country" VARCHAR(100) DEFAULT 'France',
    "designation" VARCHAR(100),
    "projects" JSONB,
    "performed" JSONB,
    "tasks" JSONB,
    "auth_user_id" UUID,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "theme" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(20),
    "entreprise" VARCHAR(255),
    "type_de_carte" VARCHAR(50),
    "numero_de_carte" VARCHAR(100),
    "date_d_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20) DEFAULT 'active',
    "image" VARCHAR(500),
    "localisation" VARCHAR(255),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialite" (
    "id" SERIAL NOT NULL,
    "libelle" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicien" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100),
    "prenom" VARCHAR(100),
    "contact" VARCHAR(20),
    "specialite_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission" (
    "num_intervention" SERIAL NOT NULL,
    "nature_intervention" VARCHAR(255),
    "objectif_du_contrat" TEXT,
    "description" TEXT,
    "date_sortie_fiche_intervention" DATE,
    "client_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_pkey" PRIMARY KEY ("num_intervention")
);

-- CreateTable
CREATE TABLE "intervention" (
    "id" SERIAL NOT NULL,
    "date_heure_debut" TIMESTAMP(3),
    "date_heure_fin" TIMESTAMP(3),
    "duree" DECIMAL(5,2),
    "mission_id" INTEGER,
    "technicien_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "check_unusual_activity" BOOLEAN NOT NULL DEFAULT true,
    "check_new_sign_in" BOOLEAN NOT NULL DEFAULT false,
    "notify_latest_news" BOOLEAN NOT NULL DEFAULT true,
    "notify_feature_update" BOOLEAN NOT NULL DEFAULT false,
    "notify_account_tips" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "username" VARCHAR(255),
    "action_type" VARCHAR(50) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER,
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip" VARCHAR(45),
    "browser" TEXT,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_instances" (
    "id" SERIAL NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "requested_by_user_id" INTEGER,
    "assigned_validator_id" INTEGER,
    "validated_by_user_id" INTEGER,
    "comments" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),

    CONSTRAINT "validation_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_libelle_key" ON "role"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "specialite_libelle_key" ON "specialite"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicien" ADD CONSTRAINT "technicien_specialite_id_fkey" FOREIGN KEY ("specialite_id") REFERENCES "specialite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "mission"("num_intervention") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "technicien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_instances" ADD CONSTRAINT "validation_instances_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_instances" ADD CONSTRAINT "validation_instances_assigned_validator_id_fkey" FOREIGN KEY ("assigned_validator_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_instances" ADD CONSTRAINT "validation_instances_validated_by_user_id_fkey" FOREIGN KEY ("validated_by_user_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
