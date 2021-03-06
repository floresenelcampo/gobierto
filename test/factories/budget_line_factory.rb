# frozen_string_literal: true

require_relative "budgets_factory"

class BudgetLineFactory

  include BudgetsFactory

  def self.doc_id(params = {})
    place = params[:place] || default_place
    year = params[:year] || default_year
    kind = params[:kind] || default_kind
    code = params[:level] ? ("1" * params[:level]) : default_code

    [place.id, year, code, kind].join("/")
  end

  def self.base_attrs(params = {})
    kind = params[:kind] || default_kind
    code = params[:level] ? ("1" * params[:level]) : default_code

    base_data(params).merge(
      code: default_code,
      level: code.length,
      kind: kind,
      population: default_population
    )
  end

  private

  def amount_per_inhabitant(amount, population)
    (amount / population).round(2)
  end

  def build_document(index, params = {})
    area = params[:area] || self.class.default_area
    amount = params[:amount] || self.class.default_amount
    population = params[:population] || self.class.default_population

    {
      index: {
        _index: index,
        _id: self.class.doc_id(params),
        _type: area,
        data: self.class.base_attrs(params).merge(
          amount: amount,
          population: population,
          amount_per_inhabitant: amount_per_inhabitant(amount, population)
        )
      }
    }
  end

end
