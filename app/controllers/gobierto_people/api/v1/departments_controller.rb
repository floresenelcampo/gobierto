# frozen_string_literal: true

module GobiertoPeople
  module Api
    module V1
      class DepartmentsController < Api::V1::BaseController

        def index
          top_departments = DepartmentsQuery.new(
            relation: Department.where(site: current_site),
            conditions: permitted_conditions,
            limit: params[:limit]
          ).results

          if params[:include_history] == "true"
            records = DepartmentsQuery.new(
              relation: Department.where(id: top_departments.map(&:id)),
              conditions: permitted_conditions
            ).results_with_history

            result = []
            result_indexes = {}

            records.each do |record|
              if (index = result_indexes[record.name])
                result[index][:value] << { key: Time.zone.parse(record.year_month), value: record.custom_events_count }
              else
                result_indexes[record.name] = result.size
                result << {
                  key: record.name,
                  value: [
                    { key: Time.zone.parse(record.year_month), value: record.custom_events_count }
                  ]
                }
              end
            end

            # sort result according to department events count
            departments_order = Hash[
              *top_departments.pluck(:name).each_with_index.collect do |department_name, index|
                [department_name, index]
              end.flatten
            ]
            result.sort! { |x, y| departments_order[x[:key]] <=> departments_order[y[:key]] }

            render json: result
          else

            render json: top_departments, each_serializer: RowchartItemSerializer
          end
        end

        private

        def parsed_parameters
          params[:from_date] = Time.zone.parse(params[:from_date]) if params[:from_date]
          params[:to_date] = Time.zone.parse(params[:to_date]) if params[:to_date]
          params
        end

        def permitted_conditions
          parsed_parameters.permit(
            :interest_group_id,
            :person_id,
            :from_date,
            :to_date
          ).to_h
        end

      end
    end
  end
end