# frozen_string_literal: true

module GobiertoCommon::CustomFieldValue
  class LocalizedText < Base
    def value
      super

      raw_value[I18n.locale.to_s]
    end

    def raw_value
      super || {}
    end
  end
end