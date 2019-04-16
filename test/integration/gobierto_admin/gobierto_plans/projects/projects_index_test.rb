# frozen_string_literal: true

require "test_helper"

module GobiertoAdmin
  module GobiertoPlans
    module Projects
      class ProjectsIndexTest < ActionDispatch::IntegrationTest
        def setup
          super
          @path = admin_plans_plan_projects_path(plan)
        end

        def admin
          @admin ||= gobierto_admin_admins(:nick)
        end

        def regular_admin
          @regular_admin ||= gobierto_admin_admins(:steve)
        end

        def site
          @site ||= sites(:madrid)
        end

        def plan
          @plan ||= gobierto_plans_plans(:strategic_plan)
        end

        def test_admin_projects_index
          with_signed_in_admin(admin) do
            with_current_site(site) do
              visit @path

              within "table#projects" do
                plan.nodes.each do |project|
                  assert has_selector?("tr#project-item-#{project.id}")
                end
              end
            end
          end
        end

        def test_regular_admin_without_groups_projects_index
          with_signed_in_admin(regular_admin) do
            with_current_site(site) do
              visit @path

              assert has_alert? "You are not authorized to perform this action"
            end
          end
        end

        def test_regular_manager_projects_index
          allow_regular_admin_manage_plans

          with_signed_in_admin(regular_admin) do
            with_current_site(site) do
              visit @path

              assert has_alert? "You are not authorized to perform this action"
            end
          end
        end

        def test_regular_admin_moderator_or_editor_index
          allow_regular_admin_moderate_plans
          allow_regular_admin_edit_plans

          with_signed_in_admin(admin) do
            with_current_site(site) do
              visit @path

              within "table#projects" do
                plan.nodes.each do |project|
                  assert has_selector?("tr#project-item-#{project.id}")
                end
              end
            end
          end
        end

        private

        def allow_regular_admin_manage_plans
          regular_admin.admin_groups << gobierto_admin_admin_groups(:madrid_manage_plans_group)
        end

        def allow_regular_admin_edit_plans
          regular_admin.admin_groups << gobierto_admin_admin_groups(:madrid_edit_plans_group)
        end

        def allow_regular_admin_moderate_plans
          regular_admin.admin_groups << gobierto_admin_admin_groups(:madrid_moderate_plans_group)
        end
      end
    end
  end
end